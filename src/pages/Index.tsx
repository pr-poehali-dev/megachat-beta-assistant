import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected';
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Привет! Я MegaChat.BETA — нейросеть-помощник. Могу ответить на любые вопросы, поиграть в города или просто поболтать. Чем могу помочь?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      name: 'Алексей',
      rating: 5,
      comment: 'Отличная нейросеть! Быстро отвечает и понимает контекст.',
      timestamp: new Date(Date.now() - 3600000),
      status: 'approved',
    },
    {
      id: '2',
      name: 'Мария',
      rating: 4,
      comment: 'Хороший помощник, но иногда зависает.',
      timestamp: new Date(Date.now() - 7200000),
      status: 'pending',
    },
  ]);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    rating: 5,
    comment: '',
  });
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateTyping = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      setIsTyping(true);
      setTimeout(() => {
        const newMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
        setIsTyping(false);
        resolve();
      }, 1000 + Math.random() * 1000);
    });
  };

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('город') && lowerMessage.includes('игра')) {
      return 'Отлично! Давай сыграем в города. Я начну: Москва. Твой ход — город на букву "А"!';
    }
    
    if (lowerMessage.includes('погод')) {
      return 'Для получения актуальной погоды мне нужен доступ к интернету в реальном времени. В текущей версии я работаю офлайн, но скоро это будет доступно!';
    }
    
    if (lowerMessage.includes('как дела') || lowerMessage.includes('привет')) {
      return 'У меня всё отлично! Готов помочь вам с любыми вопросами. Что вас интересует?';
    }
    
    if (lowerMessage.includes('что ты умеешь')) {
      return 'Я умею отвечать на вопросы, играть в слова и города, помогать с информацией, поддерживать диалог. Ещё у меня есть голосовой режим — попробуйте нажать на микрофон!';
    }
    
    return 'Интересный вопрос! В текущей версии я работаю в демо-режиме. Скоро здесь будет полноценная интеграция с нейросетью для ответов на любые вопросы.';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    const response = getAIResponse(inputValue);
    await simulateTyping(response);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Ваш браузер не поддерживает голосовой ввод');
      return;
    }

    if (isListening) {
      setIsListening(false);
      toast.info('Голосовой ввод отключен');
    } else {
      setIsListening(true);
      toast.success('Говорите сейчас...');
      
      setTimeout(() => {
        setIsListening(false);
        const mockText = 'Привет, как дела?';
        setInputValue(mockText);
        toast.success('Распознано: ' + mockText);
      }, 3000);
    }
  };

  const handleSubmitReview = () => {
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      toast.error('Заполните все поля');
      return;
    }

    const newReview: Review = {
      id: Date.now().toString(),
      name: reviewForm.name,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      timestamp: new Date(),
      status: 'pending',
    };

    setReviews((prev) => [newReview, ...prev]);
    setReviewForm({ name: '', rating: 5, comment: '' });
    toast.success('Спасибо за отзыв! Он отправлен на модерацию.');
  };

  const handleReviewAction = (reviewId: string, action: 'approved' | 'rejected') => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId ? { ...review, status: action } : review
      )
    );
    toast.success(action === 'approved' ? 'Отзыв одобрен' : 'Отзыв отклонён');
  };

  const deleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    toast.success('Отзыв удалён');
  };

  const getStatusBadge = (status: Review['status']) => {
    const variants = {
      pending: { label: 'На модерации', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
      approved: { label: 'Одобрен', className: 'bg-green-500/20 text-green-400 border-green-500/50' },
      rejected: { label: 'Отклонён', className: 'bg-red-500/20 text-red-400 border-red-500/50' },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    rejected: reviews.filter((r) => r.status === 'rejected').length,
    avgRating: reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '0',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1117] via-[#1a1f2e] to-[#0d1117] text-foreground">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-2 neon-text">
            MegaChat<span className="text-accent">.BETA</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Нейросеть-помощник с голосовым управлением
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-card/50 border border-border">
            <TabsTrigger value="chat" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Icon name="MessageSquare" size={16} className="mr-2" />
              Чат
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Icon name="Star" size={16} className="mr-2" />
              Отзывы
            </TabsTrigger>
            <TabsTrigger value="admin" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Icon name="Shield" size={16} className="mr-2" />
              Админ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <Card className="glass-card border-border/50 overflow-hidden">
              <ScrollArea className="h-[500px] p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-accent/20 border border-accent/50 ml-auto'
                            : 'bg-card/80 border border-border/50'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <span className="text-xs text-muted-foreground mt-2 block">
                          {message.timestamp.toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-card/80 border border-border/50 p-4 rounded-lg">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="border-t border-border/50 p-4 bg-card/30">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Напишите сообщение..."
                    className="flex-1 bg-input/50 border-border/50 focus:border-accent"
                  />
                  <Button
                    onClick={toggleVoiceInput}
                    variant="outline"
                    size="icon"
                    className={`${
                      isListening
                        ? 'bg-accent/20 border-accent neon-glow'
                        : 'border-border/50 hover:border-accent'
                    }`}
                  >
                    <Icon name={isListening ? 'MicOff' : 'Mic'} size={20} />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground neon-glow"
                  >
                    <Icon name="Send" size={20} />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card className="glass-card border-border/50 p-6">
              <h2 className="text-2xl font-bold mb-4 neon-text">Оставить отзыв</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Ваше имя</label>
                  <Input
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    placeholder="Введите имя"
                    className="bg-input/50 border-border/50 focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Оценка</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="transition-transform hover:scale-110"
                      >
                        <Icon
                          name="Star"
                          size={28}
                          className={
                            star <= reviewForm.rating
                              ? 'fill-accent text-accent'
                              : 'text-muted-foreground'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Комментарий</label>
                  <Textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Поделитесь впечатлениями..."
                    className="bg-input/50 border-border/50 focus:border-accent min-h-[100px]"
                  />
                </div>
                <Button
                  onClick={handleSubmitReview}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground neon-glow"
                >
                  Отправить отзыв
                </Button>
              </div>
            </Card>

            <Card className="glass-card border-border/50 p-6">
              <h2 className="text-2xl font-bold mb-4 neon-text">Отзывы пользователей</h2>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {reviews
                    .filter((r) => r.status === 'approved')
                    .map((review) => (
                      <div key={review.id} className="bg-card/50 border border-border/50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{review.name}</p>
                            <div className="flex gap-1 mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Icon
                                  key={i}
                                  name="Star"
                                  size={14}
                                  className={
                                    i < review.rating
                                      ? 'fill-accent text-accent'
                                      : 'text-muted-foreground'
                                  }
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.timestamp).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="glass-card border-border/50 p-4 text-center">
                <p className="text-3xl font-bold text-accent neon-text">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Всего отзывов</p>
              </Card>
              <Card className="glass-card border-border/50 p-4 text-center">
                <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
                <p className="text-xs text-muted-foreground mt-1">На модерации</p>
              </Card>
              <Card className="glass-card border-border/50 p-4 text-center">
                <p className="text-3xl font-bold text-green-400">{stats.approved}</p>
                <p className="text-xs text-muted-foreground mt-1">Одобрено</p>
              </Card>
              <Card className="glass-card border-border/50 p-4 text-center">
                <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground mt-1">Отклонено</p>
              </Card>
              <Card className="glass-card border-border/50 p-4 text-center">
                <p className="text-3xl font-bold text-accent neon-text">{stats.avgRating}</p>
                <p className="text-xs text-muted-foreground mt-1">Средняя оценка</p>
              </Card>
            </div>

            <Card className="glass-card border-border/50 p-6">
              <h2 className="text-2xl font-bold mb-4 neon-text">Управление отзывами</h2>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-card/50 border border-border/50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold">{review.name}</p>
                            {getStatusBadge(review.status)}
                          </div>
                          <div className="flex gap-1 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Icon
                                key={i}
                                name="Star"
                                size={14}
                                className={
                                  i < review.rating
                                    ? 'fill-accent text-accent'
                                    : 'text-muted-foreground'
                                }
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.timestamp).toLocaleString('ru-RU')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {review.status !== 'approved' && (
                          <Button
                            onClick={() => handleReviewAction(review.id, 'approved')}
                            size="sm"
                            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50"
                          >
                            <Icon name="Check" size={16} className="mr-1" />
                            Одобрить
                          </Button>
                        )}
                        {review.status !== 'rejected' && (
                          <Button
                            onClick={() => handleReviewAction(review.id, 'rejected')}
                            size="sm"
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50"
                          >
                            <Icon name="X" size={16} className="mr-1" />
                            Отклонить
                          </Button>
                        )}
                        <Button
                          onClick={() => deleteReview(review.id)}
                          size="sm"
                          variant="outline"
                          className="border-border/50 hover:border-red-500/50 hover:text-red-400"
                        >
                          <Icon name="Trash2" size={16} className="mr-1" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
