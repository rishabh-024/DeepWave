import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, MessageCircle, Music2, Sparkles, Star, Users } from 'lucide-react';

import Shell from '../../app/Shell';
import { useAuth } from '../../context/AuthContext';

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const pillars = [
  {
    title: 'Emotion-first listening',
    description: 'DeepWave starts from how people feel, then uses sound, reflection, and calm guidance to help them reset.',
    icon: Heart,
  },
  {
    title: 'A space that feels human',
    description: 'The community is about warmth, safety, and shared healing instead of noise, pressure, or performance.',
    icon: Users,
  },
  {
    title: 'Music with purpose',
    description: 'Every experience in DeepWave is designed to turn music into a meaningful wellness ritual, not just background audio.',
    icon: Music2,
  },
];

const highlights = [
  'DeepWave brings together mindful listening, AI-assisted support, and personal reflection in one experience.',
  'It is built for people who want calm, clarity, and emotional balance through intentional sound journeys.',
  'The community represents the values behind the product: empathy, support, creativity, and steady healing.',
];

const values = [
  {
    title: 'Gentle guidance',
    description: 'We design every interaction to feel supportive, simple, and emotionally aware.',
    icon: Sparkles,
  },
  {
    title: 'Real connection',
    description: 'DeepWave is not just a tool. It is a place where people can feel seen in their everyday mental wellness journey.',
    icon: MessageCircle,
  },
  {
    title: 'Trust and care',
    description: 'We keep the experience focused on clarity, comfort, and respect for the user.',
    icon: Star,
  },
];

function CommunityPage() {
  const { isAuthenticated } = useAuth();

  return (
    <Shell>
      <div className="pb-24 pt-28 sm:pt-32">
        <motion.section
          className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.18),_transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.94),rgba(241,245,249,0.9))] px-6 py-12 shadow-[0_24px_80px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.20),_transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(10,14,26,0.96))] sm:px-10 sm:py-16"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-400/15" />
          <div className="absolute -right-8 bottom-0 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/20" />

          <div className="relative z-10 max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/75 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <Users className="h-4 w-4 text-cyan-500" />
              DeepWave Community
            </div>

            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              DeepWave is a calm digital community built around sound, support, and emotional wellness.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
              It defines a space where music becomes more than entertainment. DeepWave brings together mindful listening,
              reflective moments, and guided experiences that help people reconnect with themselves.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={isAuthenticated ? '/studio' : '/register'}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                {isAuthenticated ? 'Open Studio' : 'Join DeepWave'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/library"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Explore Sound Library
              </Link>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="mt-10 grid gap-5 md:grid-cols-3"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-[1.75rem] border border-slate-200/70 bg-white/85 p-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-indigo-500/20 text-cyan-600 dark:text-cyan-300">
                <pillar.icon className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{pillar.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{pillar.description}</p>
            </article>
          ))}
        </motion.section>

        <motion.section
          className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="rounded-[1.75rem] border border-slate-200/70 bg-white/85 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">What Defines DeepWave</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              A wellness platform shaped like a supportive community.
            </h2>
            <div className="mt-6 space-y-4">
              {highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-slate-950/40">
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200/70 bg-gradient-to-br from-cyan-50 via-white to-indigo-50 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-gradient-to-br dark:from-cyan-500/10 dark:via-slate-950 dark:to-indigo-500/10">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Why It Matters</p>
            <p className="mt-4 text-lg leading-8 text-slate-700 dark:text-slate-200">
              DeepWave gives people a softer way to care for their mental space. It blends music, reflection, and guided
              support into a daily experience that feels personal, calm, and grounded.
            </p>
            <div className="mt-8 rounded-3xl bg-slate-900 px-6 py-5 text-white dark:bg-white dark:text-slate-900">
              <p className="text-xs font-black uppercase tracking-[0.28em] opacity-70">DeepWave Promise</p>
              <p className="mt-3 text-xl font-black leading-8">
                Build a place where healing feels accessible, beautiful, and human.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="mt-10 rounded-[1.75rem] border border-slate-200/70 bg-white/85 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Core Values</p>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {values.map((value) => (
              <article
                key={value.title}
                className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/90 p-6 dark:border-white/10 dark:bg-slate-950/40"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <value.icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{value.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{value.description}</p>
              </article>
            ))}
          </div>
        </motion.section>
      </div>
    </Shell>
  );
}

export default CommunityPage;
