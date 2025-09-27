import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, Send, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';

const UserMessagesPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Récupérer les conversations de l'utilisateur
  const fetchUserConversations = useCallback(async () => {
    if (!user) return;
    
    setLoadingConversations(true);
    try {
      // On récupère les conversations où l'utilisateur a envoyé des messages
      const { data: userMessages, error } = await supabase
        .from('messages')
        .select(`
          conversation_id,
          created_at,
          content,
          conversations:conversation_id (
            id,
            created_at,
            guest_identifier
          )
        `)
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      // Grouper par conversation et garder le message le plus récent de chaque conversation
      const conversationsMap = new Map();
      userMessages?.forEach(msg => {
        const convId = msg.conversation_id;
        if (!conversationsMap.has(convId)) {
          conversationsMap.set(convId, {
            id: convId,
            last_message: msg.content,
            last_message_at: msg.created_at,
            created_at: msg.conversations?.created_at || msg.created_at
          });
        }
      });

      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos conversations.",
        variant: "destructive"
      });
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  // Récupérer les messages d'une conversation
  const fetchMessages = useCallback(async (conversationId) => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // S'abonner aux nouveaux messages en temps réel
  useEffect(() => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`user-chat:${selectedConversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConversation.id}`
      }, (payload) => {
        setMessages((prev) => {
          const messageExists = prev.some(msg => msg.id === payload.new.id);
          if (messageExists) return prev;
          return [...prev, payload.new];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  useEffect(() => {
    fetchUserConversations();
  }, [fetchUserConversations]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const messageData = {
      conversation_id: selectedConversation.id,
      content: newMessage.trim(),
      sender_id: user.id,
      sender_role: 'user'
    };

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select();

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'envoyer le message.",
          variant: "destructive"
        });
        return;
      }

      // Ajouter le message localement pour affichage immédiat
      if (data && data[0]) {
        setMessages((prev) => [...prev, data[0]]);
      }
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Bouton de retour */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Retourner sur le tableau de bord
            </button>
          </div>

          {/* Titre de la page */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Mes messages</h1>
            <p className="text-muted-foreground">
              Gérez vos conversations avec les agents
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des conversations */}
            <Card className="lg:col-span-1 h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Conversations
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {loadingConversations ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune conversation trouvée</p>
                    <p className="text-sm mt-2">
                      Utilisez le chat sur la page d'accueil pour commencer une conversation
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conversation) => (
                      <motion.div
                        key={conversation.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={`cursor-pointer transition-colors ${
                            selectedConversation?.id === conversation.id
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-accent'
                          }`}
                          onClick={() => selectConversation(conversation)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  Conversation
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {conversation.last_message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(conversation.last_message_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Zone des messages */}
            <Card className="lg:col-span-2 h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>
                  {selectedConversation ? 'Messages' : 'Sélectionnez une conversation'}
                </CardTitle>
              </CardHeader>
              
              {selectedConversation ? (
                <>
                  <CardContent className="flex-1 overflow-y-auto">
                    {loadingMessages ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex items-end gap-2 ${
                              message.sender_role === 'admin' ? 'justify-start' : 'justify-end'
                            }`}
                          >
                            {message.sender_role === 'admin' && (
                              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                A
                              </div>
                            )}
                            <div
                              className={`max-w-[75%] rounded-lg px-3 py-2 ${
                                message.sender_role === 'admin'
                                  ? 'bg-secondary text-secondary-foreground'
                                  : 'bg-primary text-primary-foreground'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            {message.sender_role !== 'admin' && (
                              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                                <User className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </CardContent>
                  
                  <CardContent className="border-t pt-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Écrivez votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez une conversation pour voir les messages</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default UserMessagesPage;