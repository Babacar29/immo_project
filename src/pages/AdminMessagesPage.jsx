import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import Navbar from '@/components/Navbar';
import { MessageSquare, Send, User, Loader2, Bell, BellOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const AdminMessagesPage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { userProfile } = useAuth();
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  // Helper function to get display name for a conversation
  const getConversationDisplayName = (conversation) => {
    if (conversation.user_first_name) {
      return conversation.user_first_name;
    }
    return `Visiteur ${conversation.conversation_id.substring(0, 8)}`;
  };

  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    const { data, error } = await supabase.rpc('get_conversations_with_user_info');
    if (error) {
      console.error('Error fetching conversations:', error);
    } else {
      setConversations(data);
    }
    setLoadingConversations(false);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel('new_messages_admin')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          fetchConversations();
          if (payload.new.conversation_id === selectedConversation?.conversation_id) {
            setMessages((prev) => [...prev, payload.new]);
          } else {
            toast({
              title: "Nouveau message",
              description: `Vous avez un nouveau message dans une conversation.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, fetchConversations, toast]);

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setLoadingMessages(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.conversation_id)
      .order('created_at', { ascending: true });
    
    if (!error) {
      setMessages(data);
      if (conversation.unread_count > 0) {
        await supabase.from('messages').update({ is_read: true }).eq('conversation_id', conversation.conversation_id).eq('is_read', false);
        fetchConversations();
      }
    }
    setLoadingMessages(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedConversation) return;

    const messageData = {
      conversation_id: selectedConversation.conversation_id,
      content: newMessage,
      sender_id: userProfile.id,
      sender_role: 'admin',
    };

    const { data, error } = await supabase.from('messages').insert([messageData]).select().single();
    if (error) {
      console.error('Error sending message:', error);
    } else {
      setMessages(prev => [...prev, data]);
      setNewMessage('');
      fetchConversations();
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Bouton de retour */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Retourner sur la page d'administration
            </button>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center space-x-3 mb-8"
          >
            <MessageSquare className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Messagerie</h1>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
            <Card className="md:col-span-1 flex flex-col">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto">
                {loadingConversations ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((convo) => (
                      <button
                        key={convo.conversation_id}
                        onClick={() => handleSelectConversation(convo)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg transition-colors",
                          selectedConversation?.conversation_id === convo.conversation_id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <p className="font-semibold truncate">
                            {getConversationDisplayName(convo)}
                          </p>
                          {convo.unread_count > 0 && (
                            <span className="bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                              {convo.unread_count}
                            </span>
                          )}
                        </div>
                        <p className={cn("text-sm truncate", selectedConversation?.conversation_id === convo.conversation_id ? "text-primary-foreground/80" : "text-muted-foreground")}>
                          {convo.last_message}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2 flex flex-col">
              {selectedConversation ? (
                <>
                  <CardHeader className="border-b">
                    <CardTitle>Conversation avec {getConversationDisplayName(selectedConversation)}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow p-4 overflow-y-auto">
                    {loadingMessages ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender_role !== 'admin' && (
                              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                                <User className="w-4 h-4" />
                              </div>
                            )}
                            <div className={`max-w-[75%] rounded-lg px-3 py-2 ${msg.sender_role === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                              <p className="text-sm">{msg.content}</p>
                            </div>
                            {msg.sender_role === 'admin' && (
                              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">A</div>
                            )}
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                      <Input
                        type="text"
                        placeholder="Répondez ici..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </CardFooter>
                </>
              ) : (
                <div className="flex flex-col justify-center items-center h-full text-muted-foreground">
                  <MessageSquare className="w-16 h-16 mb-4" />
                  <p>Sélectionnez une conversation pour commencer.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default AdminMessagesPage;