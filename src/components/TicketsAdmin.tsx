import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface TicketMessage {
  id: string;
  author: 'user' | 'admin';
  message: string;
  timestamp: string;
}

interface Ticket {
  id: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export default function TicketsAdmin() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    // Загрузка тикетов из localStorage
    const storedTickets = JSON.parse(localStorage.getItem('support_tickets') || '[]');
    setTickets(storedTickets);
  }, []);

  const updateTicket = (ticketId: string, updates: Partial<Ticket>) => {
    const updatedTickets = tickets.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, ...updates, updatedAt: new Date().toISOString() }
        : ticket
    );
    setTickets(updatedTickets);
    localStorage.setItem('support_tickets', JSON.stringify(updatedTickets));
    
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, ...updates });
    }
  };

  const addMessage = (ticketId: string, message: string) => {
    if (!message.trim()) return;
    
    const newMsg: TicketMessage = {
      id: Date.now().toString(),
      author: 'admin',
      message,
      timestamp: new Date().toISOString()
    };
    
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      const updatedMessages = [...ticket.messages, newMsg];
      updateTicket(ticketId, { messages: updatedMessages, status: 'in_progress' });
      setNewMessage('');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { variant: 'default' as const, text: '🆕 Новый' },
      in_progress: { variant: 'outline' as const, text: '⚙️ В работе' },
      waiting_user: { variant: 'outline' as const, text: '⏳ Ждем ответа' },
      resolved: { variant: 'outline' as const, text: '✅ Решен' },
      closed: { variant: 'secondary' as const, text: '🔒 Закрыт' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'text-green-700 border-green-300', text: '🟢 Низкий' },
      medium: { color: 'text-yellow-700 border-yellow-300', text: '🟡 Средний' },
      high: { color: 'text-orange-700 border-orange-300', text: '🟠 Высокий' },
      urgent: { color: 'text-red-700 border-red-300', text: '🔴 Критический' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return <Badge variant="outline" className={config.color}>{config.text}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      bug: 'Bug',
      feature: 'Lightbulb',
      question: 'HelpCircle',
      account: 'User',
      other: 'MessageCircle'
    };
    return icons[category as keyof typeof icons] || 'MessageCircle';
  };

  const newCount = tickets.filter(t => t.status === 'new').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const waitingCount = tickets.filter(t => t.status === 'waiting_user').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  return (
    <>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{newCount}</div>
            <div className="text-sm text-gray-600">Новые</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{inProgressCount}</div>
            <div className="text-sm text-gray-600">В работе</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{waitingCount}</div>
            <div className="text-sm text-gray-600">Ждем ответа</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{resolvedCount}</div>
            <div className="text-sm text-gray-600">Решено</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Система тикетов техподдержки</CardTitle>
          <CardDescription>
            Управляйте обращениями пользователей и отвечайте на их вопросы
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <Alert>
              <Icon name="Ticket" size={16} />
              <AlertDescription>
                Обращений пока нет. Как только пользователи начнут обращаться в поддержку, тикеты появятся здесь.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Тема</TableHead>
                  <TableHead>Приоритет</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-sm">{ticket.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ticket.name}</div>
                        <div className="text-sm text-gray-600">{ticket.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Icon name={getCategoryIcon(ticket.category) as any} size={16} />
                        <span className="capitalize">{ticket.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(ticket.createdAt).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <Icon name="MessageSquare" size={14} className="mr-1" />
                            Открыть
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <Icon name="Ticket" size={20} />
                              <span>Тикет {selectedTicket?.id}</span>
                              {selectedTicket && getStatusBadge(selectedTicket.status)}
                            </DialogTitle>
                            <DialogDescription>
                              {selectedTicket?.subject}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedTicket && (
                            <div className="space-y-6">
                              {/* Информация о тикете */}
                              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                                <div><strong>Пользователь:</strong> {selectedTicket.name}</div>
                                <div><strong>Email:</strong> {selectedTicket.email}</div>
                                <div><strong>Категория:</strong> {selectedTicket.category}</div>
                                <div><strong>Приоритет:</strong> {getPriorityBadge(selectedTicket.priority)}</div>
                                <div><strong>Создан:</strong> {new Date(selectedTicket.createdAt).toLocaleString('ru-RU')}</div>
                                <div><strong>Обновлен:</strong> {new Date(selectedTicket.updatedAt).toLocaleString('ru-RU')}</div>
                              </div>
                              
                              {/* Описание проблемы */}
                              <div>
                                <h4 className="font-medium mb-2">Описание проблемы:</h4>
                                <div className="p-3 bg-gray-50 rounded whitespace-pre-wrap">
                                  {selectedTicket.description}
                                </div>
                              </div>
                              
                              {/* Переписка */}
                              <div>
                                <h4 className="font-medium mb-2">Переписка:</h4>
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                  {selectedTicket.messages.map((message) => (
                                    <div 
                                      key={message.id}
                                      className={`p-3 rounded ${
                                        message.author === 'admin' 
                                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                                          : 'bg-green-50 border-l-4 border-green-500'
                                      }`}
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <strong className={message.author === 'admin' ? 'text-blue-700' : 'text-green-700'}>
                                          {message.author === 'admin' ? 'Поддержка' : selectedTicket.name}
                                        </strong>
                                        <span className="text-sm text-gray-500">
                                          {new Date(message.timestamp).toLocaleString('ru-RU')}
                                        </span>
                                      </div>
                                      <div className="whitespace-pre-wrap">{message.message}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Ответ администратора */}
                              <div className="space-y-4 border-t pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Изменить статус:</label>
                                    <Select 
                                      value={newStatus || selectedTicket.status} 
                                      onValueChange={setNewStatus}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="new">🆕 Новый</SelectItem>
                                        <SelectItem value="in_progress">⚙️ В работе</SelectItem>
                                        <SelectItem value="waiting_user">⏳ Ждем ответа от пользователя</SelectItem>
                                        <SelectItem value="resolved">✅ Решен</SelectItem>
                                        <SelectItem value="closed">🔒 Закрыт</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="flex items-end">
                                    <Button 
                                      onClick={() => {
                                        if (newStatus && newStatus !== selectedTicket.status) {
                                          updateTicket(selectedTicket.id, { status: newStatus as any });
                                          setNewStatus('');
                                        }
                                      }}
                                      disabled={!newStatus || newStatus === selectedTicket.status}
                                      variant="outline"
                                    >
                                      Обновить статус
                                    </Button>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Ответ пользователю:</label>
                                  <Textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Введите ваш ответ..."
                                    rows={4}
                                  />
                                </div>
                                
                                <Button 
                                  onClick={() => addMessage(selectedTicket.id, newMessage)}
                                  disabled={!newMessage.trim()}
                                  className="gradient-bg"
                                >
                                  <Icon name="Send" size={16} className="mr-2" />
                                  Отправить ответ
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}