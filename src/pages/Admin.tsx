import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const [guests, setGuests] = useState<Guest[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [totalGuests, setTotalGuests] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/3483cd4c-bc8a-4541-b2ff-daf458af7499');
      const data = await response.json();

      if (data.success) {
        setGuests(data.guests);
        setTotalResponses(data.total_responses);
        setTotalGuests(data.total_guests);
      } else {
        throw new Error('Ошибка загрузки данных');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список гостей',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Админ-панель</h1>
            <p className="text-muted-foreground">Список подтвердивших гостей</p>
          </div>
          <Button onClick={loadGuests} variant="outline" className="gap-2">
            <Icon name="RefreshCw" size={18} />
            Обновить
          </Button>
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
