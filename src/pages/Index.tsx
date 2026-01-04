import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [formData, setFormData] = useState({
    name: '',
    guests: '1',
    comment: '',
    alcohol: [] as string[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const weddingDate = new Date('2026-06-16T16:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingDate.getTime() - now;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const gallery = [
    'https://cdn.poehali.dev/files/IMG_8771.jpeg',
    'https://cdn.poehali.dev/files/IMG_8772.jpeg',
    'https://cdn.poehali.dev/files/IMG_8770.jpeg'
  ];

  const dressCodeColors = [
    { name: 'Тёмно-синий', hex: '#1a3a52' },
    { name: 'Синий', hex: '#4a6fa5' },
    { name: 'Серо-голубой', hex: '#7d9ec0' },
    { name: 'Светло-голубой', hex: '#a8c5e0' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, укажите ваше имя',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('https://functions.poehali.dev/73b1af17-d463-42f4-be57-6cb3b190a40f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Спасибо!',
          description: 'Ваше подтверждение принято. Ждём вас на празднике! ❤️'
        });
        setFormData({ name: '', guests: '1', comment: '', alcohol: [] });
      } else {
        throw new Error(result.error || 'Ошибка отправки');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить подтверждение. Попробуйте позже.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center items-center gap-8">
            {['Главная', 'О свадьбе', 'Детали', 'Программа', 'Галерея', 'Подтверждение', 'Контакты'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <section id="главная" className="min-h-screen flex items-center justify-center relative pt-20">
        <div className="container mx-auto px-4 text-center animate-fade-in">
          <h1 className="text-7xl mb-6 text-primary">Елизавета & Никита</h1>
          <p className="text-2xl mb-4 text-muted-foreground">приглашают на свадьбу</p>
          <p className="text-xl mb-12 text-foreground/70">16 июня 2026 года</p>
          
          <div className="flex justify-center gap-8 mb-12">
            {[
              { label: 'Дней', value: timeLeft.days },
              { label: 'Часов', value: timeLeft.hours },
              { label: 'Минут', value: timeLeft.minutes },
              { label: 'Секунд', value: timeLeft.seconds }
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">{item.value}</div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>

          <Button size="lg" onClick={() => scrollToSection('подтверждение')} className="text-lg px-8">
            Подтвердить присутствие
          </Button>
        </div>
      </section>

      <section id="о свадьбе" className="py-24 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl text-center mb-16 text-primary">О нашей свадьбе</h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl text-foreground/80 leading-relaxed mb-8">
              Мы рады пригласить вас разделить с нами самый важный день в нашей жизни. 
              Это будет незабываемый праздник любви, радости и счастья.
            </p>
            <p className="text-lg text-muted-foreground">
              Наша история началась несколько лет назад, и теперь мы готовы начать новую главу вместе. 
              Ваше присутствие сделает этот день еще более особенным.
            </p>
          </div>
        </div>
      </section>

      <section id="детали" className="py-24 bg-card/50 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl text-center mb-16 text-primary">Детали</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 text-center animate-fade-in">
              <Icon name="Calendar" size={48} className="mx-auto mb-4 text-primary" />
              <h3 className="text-xl mb-4">Дата</h3>
              <p className="text-lg text-muted-foreground">16 июня 2026 года</p>
              <p className="text-muted-foreground">Вторник</p>
            </Card>
            <Card className="p-8 text-center animate-fade-in">
              <Icon name="Clock" size={48} className="mx-auto mb-4 text-primary" />
              <h3 className="text-xl mb-4">Время</h3>
              <p className="text-lg text-muted-foreground">16:00</p>
              <p className="text-muted-foreground">Сбор гостей в 15:30</p>
            </Card>
            <Card className="p-8 text-center animate-fade-in">
              <Icon name="MapPin" size={48} className="mx-auto mb-4 text-primary" />
              <h3 className="text-xl mb-4">Место проведения</h3>
              <p className="text-lg text-muted-foreground">Летняя веранда «Шато»</p>
              <p className="text-muted-foreground">ул. 1-ая Северная 95В</p>
            </Card>
            <Card className="p-8 text-center animate-fade-in">
              <Icon name="Shirt" size={48} className="mx-auto mb-4 text-primary" />
              <h3 className="text-xl mb-4">Дресс-код</h3>
              <p className="text-base text-muted-foreground mb-4">
                Мы будем очень признательны, если вы используете цвета нашей свадьбы в своих образах
              </p>
              <div className="flex justify-center gap-3">
                {dressCodeColors.map((color) => (
                  <div key={color.name} className="text-center">
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-border"
                      style={{ backgroundColor: color.hex }}
                    />
                    <p className="text-xs text-muted-foreground">{color.name}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-8 text-center md:col-span-2 animate-fade-in">
              <Icon name="Gift" size={48} className="mx-auto mb-4 text-primary" />
              <h3 className="text-xl mb-4">О подарках</h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-3">
                Не ломайте голову над подарками! Ваши конверты помогут нам осуществить нашу мечту!
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                К сожалению у нас не будет возможности насладиться ароматом и красотой цветов, но мы будем рады алкогольной продукции с указанием имени дарителя, для нашей домашней коллекции.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section id="программа" className="py-24 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl text-center mb-16 text-primary">Программа дня</h2>
          <div className="max-w-2xl mx-auto space-y-8">
            {[
              { time: '15:30', title: 'Сбор гостей', desc: '' },
              { time: '16:00', title: 'Выездная регистрация', desc: 'Торжественная церемония бракосочетания' },
              { time: '17:00', title: 'Банкет', desc: 'Праздничный ужин и развлекательная программа' },
              { time: '23:00', title: 'Завершение банкета', desc: 'Благодарим за этот чудесный день' }
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-3xl font-bold text-primary min-w-[100px]">{item.time}</div>
                <div className="flex-1">
                  <h3 className="text-xl mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="галерея" className="py-24 bg-card/50 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl text-center mb-16 text-primary">Наша любовь в фотографиях</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {gallery.map((img, index) => (
              <div
                key={index}
                className="aspect-[3/4] overflow-hidden rounded-lg animate-fade-in hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <img src={img} alt={`Фото ${index + 1}`} className="w-full h-full object-cover object-top" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="подтверждение" className="py-24 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl text-center mb-16 text-primary">Подтверждение присутствия</h2>
          <Card className="max-w-xl mx-auto p-8 animate-fade-in">
            <p className="text-center text-muted-foreground mb-8">
              Пожалуйста, подтвердите ваше присутствие до 1 июня 2026 года
            </p>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium mb-2">Ваше имя</label>
                <Input 
                  placeholder="Иван Иванов"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Количество гостей</label>
                <Input 
                  type="number" 
                  placeholder="1" 
                  min="1"
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-4">Предпочтения в алкоголе (можно выбрать несколько)</label>
                <div className="space-y-3">
                  {['Коньяк', 'Виски', 'Вино', 'Шампанское', 'Водка'].map((drink) => (
                    <div key={drink} className="flex items-center space-x-3">
                      <Checkbox
                        id={drink}
                        checked={formData.alcohol.includes(drink)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, alcohol: [...formData.alcohol, drink] });
                          } else {
                            setFormData({ ...formData, alcohol: formData.alcohol.filter(a => a !== drink) });
                          }
                        }}
                      />
                      <label htmlFor={drink} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                        {drink}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Комментарий (необязательно)</label>
                <Textarea 
                  placeholder="Особые пожелания или диетические ограничения"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                />
              </div>
              <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Отправка...' : 'Подтвердить присутствие'}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <section id="контакты" className="py-24 bg-card/50 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl text-center mb-16 text-primary">Контакты</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-8 text-center animate-fade-in">
                <h3 className="text-2xl mb-4">Невеста</h3>
                <p className="text-lg mb-2">Елизавета</p>
                <p className="text-muted-foreground mb-4">+7 (951) 409-55-43</p>
                <Button variant="outline" className="gap-2" asChild>
                  <a href="tel:+79514095543">
                    <Icon name="Phone" size={18} />
                    Позвонить
                  </a>
                </Button>
              </Card>
              <Card className="p-8 text-center animate-fade-in">
                <h3 className="text-2xl mb-4">Жених</h3>
                <p className="text-lg mb-2">Никита</p>
                <p className="text-muted-foreground mb-4">+7 (999) 453-42-74</p>
                <Button variant="outline" className="gap-2" asChild>
                  <a href="tel:+79994534274">
                    <Icon name="Phone" size={18} />
                    Позвонить
                  </a>
                </Button>
              </Card>
            </div>


          </div>
        </div>
      </section>

      <footer className="py-12 text-center border-t border-border relative">
        <div className="container mx-auto px-4">
          <p className="text-3xl mb-4 text-primary">Елизавета & Никита</p>
          <p className="text-muted-foreground">16 июня 2026 года</p>
          <p className="text-sm text-muted-foreground mt-4">
            С любовью ждем вас на нашем празднике ❤️
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;