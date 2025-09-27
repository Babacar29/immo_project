import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { v4 as uuidv4 } from 'uuid';

const ChatWidget = () => {
  // Updated with MessageSquare icon
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let convId = localStorage.getItem('chat_conversation_id');
    if (!convId) {
      convId = uuidv4();
      localStorage.setItem('chat_conversation_id', convId);
    }
    setConversationId(convId);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = useCallback(async (convId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    if (!error) setMessages(data);
  }, []);


  useEffect(() => {
    if (isOpen && conversationId) {
      fetchMessages(conversationId);

      const channel = supabase
        .channel(`chat:${conversationId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
          (payload) => {
            setMessages((prev) => {
              // Éviter les doublons si le message est déjà présent
              const messageExists = prev.some(msg => msg.id === payload.new.id);
              if (messageExists) return prev;
              return [...prev, payload.new];
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, conversationId, fetchMessages]);

  const ensureConversationExists = async () => {
    if (!conversationId) return false;
    // Try to create the conversation; if it already exists, ignore duplicate key errors (23505)
    const guestIdentifier = user ? null : `guest-${conversationId}`;
    const userId = user ? user.id : null;
    const { error: insertError } = await supabase
      .from('conversations')
      .upsert(
        [{ id: conversationId, guest_identifier: guestIdentifier, user_id: userId }],
        { onConflict: 'id' }
      );

    if (insertError) {
  // Upsert shouldn't raise duplicate errors, but if it does, proceed
  if (insertError.code === '23505' || insertError.details?.includes('duplicate')) return true;
      console.error('Error creating conversation:', insertError);
      return false;
    }
    return true;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !conversationId) return;

    const conversationReady = await ensureConversationExists();
    if (!conversationReady) {
        console.error("Conversation could not be created or verified.");
        return;
    }

    const messageData = {
      conversation_id: conversationId,
      content: newMessage,
      sender_id: user?.id,
      sender_role: user ? 'user' : 'guest',
    };

    const { data, error } = await supabase.from('messages').insert([messageData]).select();
    if (error) {
      console.error('Error sending message:', error);
    } else {
      // Ajouter le message immédiatement à l'état local pour affichage instantané
      if (data && data[0]) {
        setMessages((prev) => [...prev, data[0]]);
      }
      setNewMessage('');
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed bottom-24 right-4 sm:right-8 z-50"
          >
            <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                <CardTitle className="text-lg font-semibold">Contactez-nous</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender_role === 'admin' ? 'justify-start' : 'justify-end'}`}>
                      {msg.sender_role === 'admin' && (
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">A</div>
                      )}
                      <div className={`max-w-[75%] rounded-lg px-3 py-2 ${msg.sender_role === 'admin' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                       {msg.sender_role !== 'admin' && (
                        <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Écrivez un message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-4 right-4 sm:right-8 z-50"
      >
        <Button
          aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
          size="lg"
          className="rounded-full w-16 h-16 p-0 grid place-items-center bg-white hover:bg-white/95 shadow-lg border-2 border-[hsl(var(--primary))]"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-8 w-8 text-[hsl(var(--primary))]" />
          ) : (
            <MessageCircle className="h-8 w-8 text-[hsl(var(--primary))]" />
          )}
        </Button>
      </motion.div>
    </>
  );
};

export default ChatWidget;