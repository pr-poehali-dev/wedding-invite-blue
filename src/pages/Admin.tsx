import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface Guest {
  id: number;
  name: string;
  guests: number;
  alcohol: string | null;
  comment: string | null;
  created_at: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [totalGuests, setTotalGuests] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('useEffect запущен');
    const savedAuth = sessionStorage.getItem('admin_auth');
    console.log('savedAuth:', savedAuth);
    if (savedAuth === 'true') {
      console.log('Пользователь авторизован, загружаем гостей');
      setIsAuthenticated(true);
      loadGuests();
    } else {
      console.log('Пользователь не авторизован');
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Простой пароль для демонстрации - в продакшене должен быть бэкенд
    if (password === 'wedding2025') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      loadGuests();
    } else {
      toast({
        title: 'Ошибка',
        description: 'Неверный пароль',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setPassword('');
  };

  const loadGuests = async () => {
    setIsLoading(true);
    try {
      console.log('Загрузка гостей через JSONP...');
      
      // Используем JSONP для обхода CORS
      const callbackName = 'jsonpCallback' + Date.now();
      const url = `https://functions.poehali.dev/288f8051-1f4e-467a-a42c-9f7625cf3a63?callback=${callbackName}`;
      
      const data: any = await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error('Timeout'));
        }, 10000);
        
        const cleanup = () => {
          clearTimeout(timeout);
          script.remove();
          delete (window as any)[callbackName];
        };
        
        (window as any)[callbackName] = (data: any) => {
          cleanup();
          resolve(data);
        };
        
        script.onerror = () => {
          cleanup();
          reject(new Error('Failed to load script'));
        };
        
        script.src = url;
        document.head.appendChild(script);
      });
      
      console.log('Response data:', data);

      if (data.success) {
        setGuests(data.guests || []);
        setTotalResponses(data.total_responses || 0);
        setTotalGuests(data.total_guests || 0);
        console.log('Гости загружены:', data.guests?.length || 0);
      } else {
        throw new Error(data.error || 'Ошибка загрузки данных');
      }
    } catch (error) {
      console.error('Ошибка загрузки гостей:', error);
      toast({
        title: 'Ошибка загрузки',
        description: error instanceof Error ? error.message : 'Не удалось загрузить список гостей',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGuest = async (guestId: number, guestName: string) => {
    if (!confirm(`Удалить гостя "${guestName}"?`)) {
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/32c28659-d7a4-4c4e-bf24-5f8b9bc5a0f6', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ guest_id: guestId })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Гость удалён'
        });
        loadGuests();
      } else {
        throw new Error(data.error || 'Ошибка удаления');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить гостя',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const alcoholPreferences = guests.reduce((acc, guest) => {
    if (guest.alcohol) {
      acc[guest.alcohol] = (acc[guest.alcohol] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <Icon name="Lock" size={48} className="mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold text-primary mb-2">Вход в админ-панель</h1>
            <p className="text-muted-foreground">Введите пароль для доступа</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-center text-lg"
              autoFocus
            />
            <Button type="submit" className="w-full" size="lg">
              <Icon name="LogIn" size={20} className="mr-2" />
              Войти
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Админ-панель</h1>
            <p className="text-muted-foreground">Список подтвердивших гостей</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadGuests} variant="outline" className="gap-2">
              <Icon name="RefreshCw" size={18} />
              Обновить
            </Button>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <Icon name="LogOut" size={18} />
              Выйти
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Icon name="Users" size={32} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Подтверждений</p>
                <p className="text-3xl font-bold">{totalResponses}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Icon name="UserPlus" size={32} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Всего гостей</p>
                <p className="text-3xl font-bold">{totalGuests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Icon name="Wine" size={32} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Предпочтений указано</p>
                <p className="text-3xl font-bold">
                  {guests.filter(g => g.alcohol).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {Object.keys(alcoholPreferences).length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Статистика по алкоголю</h2>
            <div className="grid md:grid-cols-5 gap-4">
              {Object.entries(alcoholPreferences).map(([drink, count]) => (
                <div key={drink} className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-primary">{count}</p>
                  <p className="text-sm text-muted-foreground">{drink}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Список гостей</h2>
          {isLoading ? (
            <div className="text-center py-12">
              <Icon name="Loader2" size={48} className="mx-auto animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Загрузка данных...</p>
            </div>
          ) : guests.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Пока нет подтверждений</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>№</TableHead>
                  <TableHead>Имя</TableHead>
                  <TableHead>Кол-во гостей</TableHead>
                  <TableHead>Предпочтение в алкоголе</TableHead>
                  <TableHead>Комментарий</TableHead>
                  <TableHead>Дата подтверждения</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guests.map((guest, index) => (
                  <TableRow key={guest.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{guest.name}</TableCell>
                    <TableCell>{guest.guests}</TableCell>
                    <TableCell>
                      {guest.alcohol ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          <Icon name="Wine" size={14} />
                          {guest.alcohol}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {guest.comment ? (
                        <span className="text-sm">{guest.comment}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(guest.created_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGuest(guest.id, guest.name)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Admin;