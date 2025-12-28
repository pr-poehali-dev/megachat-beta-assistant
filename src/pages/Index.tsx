import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

const ChristmasLights = () => {
  const lights = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: i % 4 === 0 ? 'bg-red-500' : i % 4 === 1 ? 'bg-green-500' : i % 4 === 2 ? 'bg-yellow-400' : 'bg-blue-500',
    delay: i * 0.1,
  }));

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-around py-2 bg-gradient-to-b from-black/30 to-transparent">
      {lights.map((light) => (
        <div
          key={light.id}
          className={`w-3 h-3 rounded-full ${light.color} light`}
          style={{ animationDelay: `${light.delay}s` }}
        />
      ))}
    </div>
  );
};

const ChristmasTree = () => {
  return (
    <div className="fixed bottom-4 right-4 z-40 tree">
      <div className="text-7xl">🎄</div>
    </div>
  );
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🎄 Привет! Я MegaChat.BETA — ваш AI-помощник. Могу ответить на любые вопросы. С наступающим Новым Годом! Чем могу помочь?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    rating: 5,
    comment: '',
  });
  const [activeTab, setActiveTab] = useState('chat');
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputValue === '/admin') {
      setIsAdminDialogOpen(true);
      setInputValue('');
    }
  }, [inputValue]);

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
      }, 800 + Math.random() * 600);
    });
  };

  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('https://functions.poehali.dev/075097f1-1352-42e7-a4e9-704ff3170d72', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('AI недоступен');
      }

      const data = await response.json();
      return data.reply || 'Не удалось получить ответ';
    } catch (error) {
      return '⚠️ AI временно недоступен. Попробуйте позже или обратитесь на MegaSchoolChat@gmail.com';
    }
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
    const userInput = inputValue;
    setInputValue('');

    const response = await getAIResponse(userInput);
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

    const lowerName = reviewForm.name.toLowerCase();
    const lowerComment = reviewForm.comment.toLowerCase();
    
    const badWords = ['админ', 'admin', 'модератор', 'moderator'];
    const hasBadName = badWords.some(word => lowerName.includes(word));
    
    const profanityWords = ['мат', 'оскорбление', 'дурак', 'идиот'];
    const hasProfanity = profanityWords.some(word => lowerComment.includes(word));

    if (hasBadName) {
      toast.error('❌ Нельзя использовать никнейм "Админ" или похожие');
      return;
    }

    if (hasProfanity) {
      toast.error('❌ Запрещены мат и оскорбления в отзывах');
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
    toast.success('🎄 Спасибо за отзыв! Он отправлен на модерацию.');
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

  const handleAdminLogin = () => {
    if (adminPassword === 'stepan12') {
      setIsAdminAuthenticated(true);
      setIsAdminDialogOpen(false);
      setActiveTab('admin');
      setAdminPassword('');
      toast.success('🎄 Добро пожаловать в админ-панель!');
    } else {
      toast.error('Неверный пароль');
    }
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f0f] via-[#0d2818] to-[#061508] text-foreground relative overflow-hidden">
      <ChristmasLights />
      <ChristmasTree />
      
      <div className="container mx-auto px-4 py-16 max-w-7xl relative z-10">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">🎄</span>
            <h1 className="text-5xl font-bold glow-text">
              MegaChat<span className="text-primary">.BETA</span>
            </h1>
            <span className="text-4xl">🎁</span>
          </div>
          <p className="text-muted-foreground text-sm">
            AI-помощник с голосовым управлением
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 glass-card">
            <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="MessageSquare" size={16} className="mr-2" />
              Чат
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Star" size={16} className="mr-2" />
              Отзывы
            </TabsTrigger>
            <TabsTrigger value="rules" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="BookOpen" size={16} className="mr-2" />
              Правила
            </TabsTrigger>
            {isAdminAuthenticated && (
              <TabsTrigger value="admin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground col-span-3">
                <Icon name="Shield" size={16} className="mr-2" />
                Админ-панель
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <Card className="glass-card overflow-hidden glow-border">
              <ScrollArea className="h-[500px] p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-primary/20 border border-primary/30'
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
                      <div className="bg-card/80 border border-border/50 p-4 rounded-2xl">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                    className="flex-1 bg-input/50 border-border/50 focus:border-primary rounded-xl"
                  />
                  <Button
                    onClick={toggleVoiceInput}
                    variant="outline"
                    size="icon"
                    className={`rounded-xl ${
                      isListening
                        ? 'bg-primary/20 border-primary'
                        : 'border-border/50 hover:border-primary'
                    }`}
                  >
                    <Icon name={isListening ? 'MicOff' : 'Mic'} size={20} />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                  >
                    <Icon name="Send" size={20} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Введите <code className="bg-muted px-1 rounded">/admin</code> для доступа к панели администратора
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card className="glass-card glow-border p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 glow-text">
                <span>🎅</span> Оставить отзыв
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Ваше имя</label>
                  <Input
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    placeholder="Введите имя"
                    className="bg-input/50 border-border/50 focus:border-primary rounded-xl"
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
                              ? 'fill-yellow-400 text-yellow-400'
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
                    className="bg-input/50 border-border/50 focus:border-primary min-h-[100px] rounded-xl"
                  />
                </div>
                <Button
                  onClick={handleSubmitReview}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                >
                  <Icon name="Send" size={16} className="mr-2" />
                  Отправить отзыв
                </Button>
              </div>
            </Card>

            <Card className="glass-card glow-border p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 glow-text">
                <span>⭐</span> Отзывы пользователей
              </h2>
              <ScrollArea className="h-[400px]">
                {reviews.filter((r) => r.status === 'approved').length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="MessageSquare" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Пока нет отзывов. Будьте первым!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews
                      .filter((r) => r.status === 'approved')
                      .map((review) => (
                        <div key={review.id} className="bg-card/50 border border-border/50 p-4 rounded-xl">
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
                                        ? 'fill-yellow-400 text-yellow-400'
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
                )}
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <Card className="glass-card glow-border p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 glow-text">
                <span>📜</span> Пользовательское соглашение
              </h2>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">❌ Запрещено:</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Использовать мат и нецензурные выражения</li>
                    <li>Оскорблять других пользователей</li>
                    <li>Выдавать себя за администрацию (никнейм "Админ", "Admin" и похожие)</li>
                    <li>Размещать спам и рекламу</li>
                    <li>Публиковать личную информацию других людей</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">✅ Разрешено:</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Задавать любые вопросы AI-помощнику</li>
                    <li>Оставлять честные отзывы</li>
                    <li>Общаться вежливо и уважительно</li>
                    <li>Делиться опытом использования сервиса</li>
                  </ul>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <h3 className="text-lg font-semibold text-primary mb-2">📧 Контакты:</h3>
                  <p className="text-muted-foreground mb-2">
                    Email: <a href="mailto:MegaSchoolChat@gmail.com" className="text-primary hover:underline">MegaSchoolChat@gmail.com</a>
                  </p>
                  <p className="text-muted-foreground mb-2">
                    Инфо-портал: <a href="https://megachat-info-portal--preview.poehali.dev/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">megachat-info-portal</a>
                  </p>
                  <p className="text-muted-foreground">
                    Официальный сайт: <a href="https://ai-school-tools--preview.poehali.dev/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ai-school-tools</a>
                  </p>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <h3 className="text-lg font-semibold text-primary mb-3">👨‍💻 О разработчике:</h3>
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <img 
                      src="https://cdn.poehali.dev/files/photo_5370601556065062292_y.jpg" 
                      alt="Степан Петров"
                      className="w-48 h-48 rounded-xl object-cover border-2 border-primary/50 shadow-lg"
                    />
                    <div>
                      <p className="text-lg font-semibold mb-2">Степан Петров</p>
                      <p className="text-muted-foreground mb-3">
                        Проект создан и принадлежит талантливому:
                      </p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>🎮 Майнкрафтеру</li>
                        <li>👨‍💻 Программисту</li>
                        <li>🎤 Певцу</li>
                        <li>📹 Блогеру</li>
                        <li>😁 И просто душке Стёпе!</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground border-t border-border/50 pt-4">
                  <p>Используя MegaChat.BETA, вы соглашаетесь с данными правилами.</p>
                  <p className="mt-1">При нарушении правил администрация оставляет за собой право удалять отзывы и ограничивать доступ.</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {isAdminAuthenticated && (
            <TabsContent value="admin" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="glass-card glow-border p-4 text-center">
                  <p className="text-3xl font-bold text-primary glow-text">{stats.total}</p>
                  <p className="text-xs text-muted-foreground mt-1">Всего отзывов</p>
                </Card>
                <Card className="glass-card glow-border p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-400 glow-text">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground mt-1">На модерации</p>
                </Card>
                <Card className="glass-card glow-border p-4 text-center">
                  <p className="text-3xl font-bold text-green-400 glow-text">{stats.approved}</p>
                  <p className="text-xs text-muted-foreground mt-1">Одобрено</p>
                </Card>
                <Card className="glass-card glow-border p-4 text-center">
                  <p className="text-3xl font-bold text-red-400 glow-text">{stats.rejected}</p>
                  <p className="text-xs text-muted-foreground mt-1">Отклонено</p>
                </Card>
                <Card className="glass-card glow-border p-4 text-center">
                  <p className="text-3xl font-bold text-accent glow-text">{stats.avgRating}</p>
                  <p className="text-xs text-muted-foreground mt-1">Средняя оценка</p>
                </Card>
              </div>

              <Card className="glass-card glow-border p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 glow-text">
                  <span>🎄</span> Управление отзывами
                </h2>
                <ScrollArea className="h-[500px]">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Отзывов пока нет</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="bg-card/50 border border-border/50 p-4 rounded-xl">
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
                                        ? 'fill-yellow-400 text-yellow-400'
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
                                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50 rounded-lg"
                              >
                                <Icon name="Check" size={16} className="mr-1" />
                                Одобрить
                              </Button>
                            )}
                            {review.status !== 'rejected' && (
                              <Button
                                onClick={() => handleReviewAction(review.id, 'rejected')}
                                size="sm"
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-lg"
                              >
                                <Icon name="X" size={16} className="mr-1" />
                                Отклонить
                              </Button>
                            )}
                            <Button
                              onClick={() => deleteReview(review.id)}
                              size="sm"
                              variant="outline"
                              className="border-border/50 hover:border-red-500/50 hover:text-red-400 rounded-lg"
                            >
                              <Icon name="Trash2" size={16} className="mr-1" />
                              Удалить
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent className="sm:max-w-md glass-card glow-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 glow-text">
              <Icon name="Shield" size={24} className="text-primary" />
              Вход в админ-панель
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Пароль</label>
              <Input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="Введите пароль"
                className="bg-input/50 border-border/50 focus:border-primary rounded-xl"
              />
            </div>
            <Button
              onClick={handleAdminLogin}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            >
              Войти
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
