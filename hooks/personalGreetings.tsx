import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AgeGroup = {
  label: string;
  range: [number, number];
  jokes: string[];
};

const ageGroups: AgeGroup[] = [
  {
    label: 'Anak-anak',
    range: [0, 12],
    jokes: [
      '🧃 Jangan lupa minum susu biar tumbuh tinggi dan pintar!',
      '🎮 Main game boleh, tapi belajar dulu ya!',
      '🍭 Kamu tuh manis banget, kayak permen kapas!',
      '📚 Belajar yuk, masa kalah sama Doraemon.',
      '🐤 Bangun pagi bikin kamu jadi anak hebat!',
      '🌈 Dunia penuh warna, sama kayak kamu yang ceria!',
    ],
  },
  {
    label: 'Remaja',
    range: [13, 17],
    jokes: [
      '📱 Scroll TikTok terus, kapan belajarnya?',
      '😎 Hidup remaja: banyak gaya, banyak drama!',
      '🍜 Makan mie terus, kapan makannya sayur?',
      '🎧 Jangan galau terus, lagu sedih tuh cuma 3 menit!',
      '💡 Jangan insecure, kamu tuh satu-satunya di dunia ini!',
      '📖 PR emang nyebelin, tapi nilai juga penting, ya!',
    ],
  },
  {
    label: 'Anak Muda',
    range: [18, 24],
    jokes: [
      '☕ Lagi sibuk nyari jati diri atau kopi gratis?',
      '💸 Gaji UMR, gaya sultan. Respect.',
      '📅 Deadline dan overthinking: combo anak muda!',
      '🍜 Tanggal tua, mie instan jadi sahabat.',
      '🚀 Kamu nggak nyasar, kamu lagi cari arah hidup.',
      '🔋 Jangan lupa recharge... bukan HP doang, mental juga.',
      '💬 Chat nggak dibales? Tenang, hidup masih panjang.',
    ],
  },
  {
    label: 'Dewasa Awal',
    range: [25, 34],
    jokes: [
      '🧾 Bayar cicilan dulu, baru healing!',
      '🍽️ Weekend? Masak sendiri biar hemat!',
      '👶 Temen nikah, kamu masih cari passion.',
      '🧘‍♀️ Pelan-pelan... quarter life crisis bukan akhir segalanya.',
      '📈 Hidup bukan lomba, tapi progress tetap penting.',
      '📦 Tokopedia dan Shopee udah kayak temen sendiri.',
      '🧠 Capek kerja? Yuk rehat, bukan menyerah.',
    ],
  },
  {
    label: 'Dewasa Menengah',
    range: [35, 49],
    jokes: [
      '💼 Pekerjaan numpuk? Tenang, napas dulu.',
      '🍵 Hidup santai, yang penting waras.',
      '🏡 Anak sekolah, kamu kerja. Kapan pikniknya?',
      '🧘‍♂️ Me time adalah kebutuhan, bukan kemewahan.',
      '🔧 Kalau capek, nggak apa-apa istirahat dulu.',
      '🗂️ Jadwal padat, tapi tetap semangat.',
    ],
  },
  {
    label: 'Usia Matang',
    range: [50, 100],
    jokes: [
      '☀️ Pagi-pagi jalan kaki, sehat terus ya!',
      '📺 Tontonan favorit: berita dan sinetron sore.',
      '🌿 Hidup tenang itu nikmat yang mahal.',
      '💬 Cerita zaman dulu emang selalu paling seru.',
      '🙏 Sehat selalu, semangat tetap terjaga!',
      '🍵 Nikmatin waktu luang, kamu pantas istirahat.',
    ],
  },
];


const getTimeGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 4 && hour < 12) return { emoji: '☀️', label: 'Selamat pagi' };
  if (hour >= 12 && hour < 15) return { emoji: '🌞', label: 'Selamat siang' };
  if (hour >= 15 && hour < 18) return { emoji: '🌤️', label: 'Selamat sore' };
  if (hour >= 18 && hour < 21) return { emoji: '🌇', label: 'Selamat petang' };
  return { emoji: '🌙', label: 'Selamat malam' };
};

export function usePersonalGreeting() {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [greetingMessage, setGreetingMessage] = useState('');
  const [ageLabel, setAgeLabel] = useState('');
  const [joke, setJoke] = useState('');
  const [timeGreeting, setTimeGreeting] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const raw = await AsyncStorage.getItem('userProfile');
      if (raw) {
        const parsed = JSON.parse(raw);
        const userName = parsed.name || '';
        const userAge = parsed.age || null;

        setName(userName);
        setAge(userAge);

        const { emoji, label } = getTimeGreeting();
        setTimeGreeting(label);

        const fullGreeting = `${emoji} ${label}, ${userName} 👋`;
        setGreetingMessage(fullGreeting);

        const group = ageGroups.find(
          (g) => userAge >= g.range[0] && userAge <= g.range[1]
        );

        if (group) {
          setAgeLabel(group.label);
          const selected = group.jokes[Math.floor(Math.random() * group.jokes.length)];
          setJoke(selected);
        } else {
          setAgeLabel('Umur tidak diketahui');
          setJoke('👋 Halo, semangat ya hari ini!');
        }
      }
    };

    loadData();
  }, []);

  return {
    name,
    age,
    timeGreeting,
    ageLabel,
    greetingMessage,
    joke,
  };
}
