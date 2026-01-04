import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Index = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

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
    'https://cdn.poehali.dev/files/IMG_8773.jpeg',
    'https://cdn.poehali.dev/files/IMG_8772.jpeg',
    'https://cdn.poehali.dev/files/IMG_8770.jpeg',
    'https://cdn.poehali.dev/files/IMG_8771.jpeg'
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] text-[40rem] font-bold text-primary/10 select-none animate-float">
          Е
        </div>
        <div className="absolute bottom-[-20%] left-[-10%] text-[40rem] font-bold text-primary/10 select-none animate-float" style={{ animationDelay: '3s' }}>
          Н
        </div>
      </div>

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
          <h1 className="text-8xl mb-6 text-primary">Елизавета & Никита</h1>
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
          <h2 className="text-6xl text-center mb-16 text-primary">О нашей свадьбе</h2>
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
          <h2 className="text-6xl text-center mb-16 text-primary">Детали</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 text-center">
              <Icon name="Calendar" size={48} className="mx-auto mb-4 text-primary" />
              <h3 className="text-2xl mb-4">Дата</h3>
              <p className="text-lg text-muted-foreground">16 июня 2026 года</p>
              <p className="text-muted-foreground">Понедельник</p>
            </Card>
            <Card className="p-8 text-center">
              <Icon name="Clock" size={48} className="mx-auto mb-4 text-primary" />
              <h3 className="text-2xl mb-4">Время</h3>
              <p className="text-lg text-muted-foreground">16:00</p>
              <p className="text-muted-foreground">Сбор гостей в 15:30</p>
            </Card>
            <Card className="p-8 text-center">
              <Icon name="MapPin" size={48} className="mx-auto mb-4 text-primary" />
              <h3 className="text-2xl mb-4">Место проведения</h3>
              <p className="text-lg text-muted-foreground">Ресторан "Шато"</p>
              <p className="text-muted-foreground">г. Омск, ул. 1-я Северная, 95В</p>
            </Card>
            <Card className="p-8 text-center">
              <Icon name="Shirt" size={48} className="mx-auto mb-4 text-primary" />
              <h3 className="text-2xl mb-4">Дресс-код</h3>
              <p className="text-lg text-muted-foreground">Формальный стиль</p>
              <p className="text-muted-foreground">Синие оттенки приветствуются</p>
            </Card>
          </div>
        </div>
      </section>

      <section id="программа" className="py-24 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-6xl text-center mb-16 text-primary">Программа дня</h2>
          <div className="max-w-2xl mx-auto space-y-8">
            {[
              { time: '15:30', title: 'Сбор гостей', desc: 'Приветствуем гостей и предлагаем welcome drink' },
              { time: '16:00', title: 'Выездная регистрация', desc: 'Торжественная церемония бракосочетания' },
              { time: '17:00', title: 'Банкет', desc: 'Праздничный ужин и развлекательная программа' },
              { time: '19:00', title: 'Первый танец', desc: 'Открытие танцпола молодоженами' },
              { time: '20:00', title: 'Торт и десерты', desc: 'Разрезание свадебного торта' },
              { time: '21:00', title: 'Танцы до утра', desc: 'Дискотека и веселье' }
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-3xl font-bold text-primary min-w-[100px]">{item.time}</div>
                <div className="flex-1">
                  <h3 className="text-2xl mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="галерея" className="py-24 bg-card/50 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-6xl text-center mb-16 text-primary">Наша история</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {gallery.map((img, index) => (
              <div
                key={index}
                className="aspect-square overflow-hidden rounded-lg animate-fade-in hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <img src={img} alt={`Фото ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="подтверждение" className="py-24 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-6xl text-center mb-16 text-primary">Подтверждение присутствия</h2>
          <Card className="max-w-xl mx-auto p-8">
            <p className="text-center text-muted-foreground mb-8">
              Пожалуйста, подтвердите ваше присутствие до 1 июня 2026 года
            </p>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Ваше имя</label>
                <Input placeholder="Иван Иванов" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Количество гостей</label>
                <Input type="number" placeholder="1" min="1" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Комментарий (необязательно)</label>
                <Textarea placeholder="Особые пожелания или диетические ограничения" />
              </div>
              <Button className="w-full" size="lg">
                Подтвердить присутствие
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <section id="контакты" className="py-24 bg-card/50 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-6xl text-center mb-16 text-primary">Контакты</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-8 text-center">
                <h3 className="text-2xl mb-4">Координатор</h3>
                <p className="text-lg mb-2">Анна Смирнова</p>
                <p className="text-muted-foreground mb-4">+7 (999) 123-45-67</p>
                <Button variant="outline" className="gap-2">
                  <Icon name="Phone" size={18} />
                  Позвонить
                </Button>
              </Card>
              <Card className="p-8 text-center">
                <h3 className="text-2xl mb-4">По вопросам</h3>
                <p className="text-lg mb-2">wedding@example.com</p>
                <p className="text-muted-foreground mb-4">Ответим в течение 24 часов</p>
                <Button variant="outline" className="gap-2">
                  <Icon name="Mail" size={18} />
                  Написать
                </Button>
              </Card>
            </div>

            <Card className="p-8">
              <h3 className="text-2xl mb-6 text-center">Как добраться</h3>
              <div className="aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Icon name="MapPin" size={48} className="mx-auto mb-4" />
                  <p className="text-lg">Интерактивная карта</p>
                  <p className="text-sm">Ресторан "Шато"</p>
                  <p className="text-sm">г. Омск, ул. 1-я Северная, 95В</p>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" className="gap-2">
                  <Icon name="Navigation" size={18} />
                  Открыть в картах
                </Button>
                <Button variant="outline" className="gap-2">
                  <Icon name="Car" size={18} />
                  Парковка рядом
                </Button>
              </div>
            </Card>
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
