import { useRef, useState } from 'react'

type GameMode = 'truth' | 'dare'

const truthPrompts = [
  'Lia ki kaunsi aadat tujhe secretly funny lagti hai?',
  'Sabse embarrassing memory kaunsi hai?',
  'Russian ke alawa kaunsa nickname tujhe suit karta hai?',
  'Is saal tune sabse questionable decision kya liya?',
  'Kaunsa food poora week kha sakte ho?',
  'Current main-character song kaunsa hai?',
  'Lia ki kaunsi baat documentary deserve karti hai?',
]

const darePrompts = [
  'Lia ko voice note bhej: “Main sabse adorable Russian aunty hoon” serious voice mein.',
  '10 seconds ka dramatic movie-star pose de. Haan, abhi.',
  'Apni friendship ko describe karne wale teen words Lia ko text kar.',
  'Birthday wish bana aur candle bujhne se pehle Lia ko bata.',
  'Apni camera roll ka sabse weird selfie bhej.',
  'Apne liye ek naya nickname invent kar aur lawyer ki tarah defend kar.',
  '“Most Sharmeeli Russian” award ke liye 15-second speech de.',
]

const rapidQuestions = [
  { question: 'Late-night snack?', options: ['Spicy noodles', 'Suspiciously bada dessert'] },
  { question: 'Perfect birthday plan?', options: ['Full chaotic adventure', 'Ghar pe rehke iconic banna'] },
  { question: 'Secret superpower?', options: ['Sabko hasaana', 'Grand entry maarna'] },
  { question: 'Apni team choose kar:', options: ['Lia, obviously', 'Ek very smart potato'] },
  { question: 'Most Russian energy?', options: ['Dramatic silence', 'Unplanned comedy'] },
]

const moments = [
  'Woh laugh jisme hum dono recover hi nahi kar paaye.',
  'Woh conversations jo normal start hoti hain aur bilkul unhinged end.',
  'Har chhota “tu theek hai?” jo secretly “main hoon na” hota hai.',
  'Woh inside jokes jo kisi aur ko explain karna impossible hai.',
  'Woh random plans jo somehow best memories ban jaate hain.',
]

const confetti = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 47) % 100}%`,
  delay: `${(index % 8) * 0.12}s`,
  color: ['#f4c95d', '#ee6a68', '#8bc6a6', '#dca7df'][index % 4],
}))

function App() {
  const [page, setPage] = useState(0)
  const [closed, setClosed] = useState(false)
  const [mode, setMode] = useState<GameMode>('truth')
  const [promptIndex, setPromptIndex] = useState(0)
  const [rapidIndex, setRapidIndex] = useState(0)
  const [rapidChoice, setRapidChoice] = useState<string | null>(null)
  const [momentIndex, setMomentIndex] = useState(0)
  const [celebrating, setCelebrating] = useState(false)
  const [musicOn, setMusicOn] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const instrumentTimerRef = useRef<number | null>(null)
  const musicActiveRef = useRef(false)
  const voiceSpokenRef = useRef(false)

  const prompts = mode === 'truth' ? truthPrompts : darePrompts
  const celebrate = () => {
    setCelebrating(true)
    window.setTimeout(() => setCelebrating(false), 1200)
  }
  const startAmbientMusic = () => {
    if (musicActiveRef.current) return
    const context = new AudioContext()
    const master = context.createGain()
    const filter = context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 900
    filter.Q.value = 0.45
    master.gain.value = 0.028
    filter.connect(master)
    master.connect(context.destination)

    const playPluck = (frequency: number) => {
      const oscillator = context.createOscillator()
      const envelope = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      oscillator.connect(envelope)
      envelope.connect(filter)
      const now = context.currentTime
      envelope.gain.setValueAtTime(0.0001, now)
      envelope.gain.exponentialRampToValueAtTime(0.18, now + 0.025)
      envelope.gain.exponentialRampToValueAtTime(0.0001, now + 1.35)
      oscillator.start()
      oscillator.stop(now + 1.4)
    }

    const melody = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23]
    let noteIndex = 0
    playPluck(melody[noteIndex])
    noteIndex += 1
    instrumentTimerRef.current = window.setInterval(() => {
      playPluck(melody[noteIndex % melody.length])
      noteIndex += 1
    }, 850)
    audioContextRef.current = context
    musicActiveRef.current = true
    setMusicOn(true)
  }

  const stopAmbientMusic = () => {
    if (instrumentTimerRef.current !== null) {
      window.clearInterval(instrumentTimerRef.current)
      instrumentTimerRef.current = null
    }
    void audioContextRef.current?.close()
    audioContextRef.current = null
    musicActiveRef.current = false
  }

  const speakBirthdayMessage = () => {
    if (voiceSpokenRef.current || !('speechSynthesis' in window)) return
    const feminineVoiceNames = /samantha|jenny|zira|aria|ava|victoria|karen|fiona|susan|hazel|female|woman/i
    const speakWithFemaleVoice = () => {
      if (voiceSpokenRef.current) return
      const voices = window.speechSynthesis.getVoices().filter((item) => item.lang.toLowerCase().startsWith('en'))
      const preferredVoice = voices.find((item) => feminineVoiceNames.test(item.name))
      if (!preferredVoice) return
      const voice = new SpeechSynthesisUtterance('Happiest birthday, Umang. You are so special to me. I love you so much as a friend, and I hope you will always be there through my thick and thin. You are the best. Once again, a very happy birthday, my dear.')
      voice.voice = preferredVoice
      voice.rate = 0.78
      voice.pitch = 1.2
      voice.volume = 0.5
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(voice)
      voiceSpokenRef.current = true
    }
    speakWithFemaleVoice()
    if (!voiceSpokenRef.current) {
      window.speechSynthesis.addEventListener('voiceschanged', speakWithFemaleVoice, { once: true })
      window.setTimeout(speakWithFemaleVoice, 500)
    }
  }

  const startMusic = () => {
    startAmbientMusic()
    speakBirthdayMessage()
  }
  const toggleMusic = () => {
    if (musicOn) {
      stopAmbientMusic()
      window.speechSynthesis.cancel()
      setMusicOn(false)
      return
    }
    startMusic()
  }
  const nextPage = () => {
    startMusic()
    setPage((current) => Math.min(current + 1, 8))
  }
  const nextPrompt = () => {
    setPromptIndex((current) => (current + 1) % prompts.length)
    celebrate()
  }
  const chooseMode = (nextMode: GameMode) => {
    setMode(nextMode)
    setPromptIndex(0)
  }
  const nextRapidQuestion = () => {
    setRapidChoice(null)
    setRapidIndex((current) => (current + 1) % rapidQuestions.length)
  }
  const pickRapidChoice = (choice: string) => {
    setRapidChoice(choice)
    celebrate()
  }
  const nextMoment = () => {
    setMomentIndex((current) => (current + 1) % moments.length)
    celebrate()
  }

  if (closed) {
    return <main className="site-shell closed-screen"><div className="closing-star">✦</div><h1>The end.</h1><p>Ab jaa, birthday boy. Enjoy your day, Russian.</p></main>
  }

  return (
    <main className="site-shell paged-site">
      <div className="grain" aria-hidden="true" />
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="floating-hearts" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span><span>✧</span></div>
      <nav className="topbar"><div className="brand-mark"><span>✦</span> RUSSIAN / 17.09</div><div className="topbar-actions"><button className={`music-toggle ${musicOn ? 'is-playing' : ''}`} onClick={toggleMusic} aria-label={musicOn ? 'Pause instrumental and voice' : 'Play instrumental and voice'}>{musicOn ? '♫ playing' : '♫ instrument + voice'}</button><div className="page-count">0{page + 1} / 09</div></div></nav>

      {page === 0 && <section className="hero-section section-wrap page-screen first-hero"><div className="hero-copy"><p className="eyebrow">MERE FAVOURITE CHAOS FRIEND KE LIYE</p><h2>Happy birthday,<br /><span>sharmeeli</span><br />Russian aunty.</h2><p className="hero-lede">Aaj ka din officially tera hai: teri hasi, tere random decisions, teri lovely chaos aur woh sab reasons jinke wajah se tu impossible not to celebrate hai. Eighteen looks good on you, unfortunately.</p><div className="hero-actions"><div className="eighteen-burst" aria-label="Umang is turning 18"><span>✦</span><b>18</b><small>finally legal<br />to be dramatic</small></div></div></div><div className="hero-portrait" aria-label="A birthday cake illustration"><div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="cake-glow" /><div className="cake-plate" /><div className="cake"><div className="candle candle-one"><i /></div><div className="candle candle-two"><i /></div><div className="candle candle-three"><i /></div><div className="cake-top" /><div className="cake-body"><b>18</b></div></div><p className="cake-caption">wish bana, birthday boy</p></div><button className="page-next primary-button" onClick={nextPage}>Next <span>→</span></button></section>}
      {page === 1 && <section className="opening-screen page-screen"><p className="eyebrow">Lia x Russian</p><div className="opening-star">✦</div><h1>Happy Birthday<br /><em>Russian</em></h1><p className="opening-copy">EIGHTEEN.</p><button className="primary-button open-button" onClick={nextPage}>Next <span>→</span></button><p className="date-stamp">17 · 09</p></section>}
      {page === 2 && <section className="hero-section section-wrap page-screen"><div className="hero-copy"><p className="eyebrow">SHARMEELI</p><h2>Russian<br /><span>AUNTY.</span></h2><p className="hero-lede">Bas itna hi bolungi: iconic.</p><div className="hero-actions"><div className="eighteen-burst" aria-label="Umang is turning 18"><span>✦</span><b>18</b><small>finally legal<br />to be dramatic</small></div></div></div><div className="hero-portrait" aria-label="A birthday cake illustration"><div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="cake-glow" /><div className="cake-plate" /><div className="cake"><div className="candle candle-one"><i /></div><div className="candle candle-two"><i /></div><div className="candle candle-three"><i /></div><div className="cake-top" /><div className="cake-body"><b>18</b></div></div><p className="cake-caption">wish bana</p></div><button className="page-next primary-button" onClick={nextPage}>Next <span>→</span></button></section>}

      {page === 3 && <section className="message-page page-screen"><p className="eyebrow">FROM LIA</p><h2>Tu hamesha<br /><em>khush reh.</em></h2><p className="message-small">Bas. Itna important hai.</p><button className="page-next primary-button" onClick={nextPage}>Next <span>→</span></button></section>}

      {page === 4 && <section className="message-page page-screen"><p className="eyebrow">ALSO</p><h2>Tu aur teri<br /><em>harkatein.</em></h2><p className="message-small">I still think tujhe ye Russian kyun banna tha.</p><p className="message-laugh">Very suspicious. Very funny.</p><button className="page-next primary-button" onClick={nextPage}>Next <span>→</span></button></section>}

      {page === 5 && <section className="memory-section section-wrap page-screen"><div className="section-heading"><p className="eyebrow">THREE THINGS</p><h3>Read this.<br /><em>Then Next.</em></h3></div><div className="memory-grid"><article className="memory-card card-coral"><span className="card-icon">☼</span><h4>Funny.</h4><p>Non-stop entertainment.</p><span className="card-number">01</span></article><article className="memory-card card-gold"><span className="card-icon">✷</span><h4>Kind.</h4><p>Rare. Keep it.</p><span className="card-number">02</span></article><article className="memory-card card-sage"><span className="card-icon">⚡</span><h4>Stuck.</h4><p>With Lia. Obviously.</p><span className="card-number">03</span></article></div><button className="page-next primary-button" onClick={nextPage}>Next <span>→</span></button></section>}

      {page === 6 && <section className="game-section section-wrap page-screen"><div className="game-intro"><p className="eyebrow">QUESTION TIME</p><h3>Truth ya<br /><em>dare?</em></h3><p>Choose one.</p><div className="mode-toggle"><button className={mode === 'truth' ? 'active' : ''} onClick={() => chooseMode('truth')}>♡ Truth</button><button className={mode === 'dare' ? 'active' : ''} onClick={() => chooseMode('dare')}>✦ Dare</button></div></div><div className={`prompt-card ${celebrating ? 'is-celebrating' : ''}`}><span className="prompt-label">{mode === 'truth' ? 'sach bol' : 'himmat dikha'}</span><div className="prompt-mark">{mode === 'truth' ? '“' : '✦'}</div><p>{prompts[promptIndex]}</p><button className="round-button" onClick={nextPrompt} aria-label="Get another prompt">↻</button>{celebrating && <div className="mini-confetti" aria-hidden="true">{confetti.slice(0, 10).map((piece) => <i key={piece.id} style={{ left: piece.left, animationDelay: piece.delay, backgroundColor: piece.color }} />)}</div>}</div><button className="page-next primary-button" onClick={nextPage}>Next <span>→</span></button></section>}

      {page === 7 && <section className="extras-section section-wrap page-screen"><div className="rapid-card"><div className="rapid-copy"><p className="eyebrow">QUICK ROUND</p><h3>Rapid-fire<br /><em>Russian.</em></h3><p>Pick one.</p></div><div className="rapid-question"><span className="question-count">0{rapidIndex + 1} / 0{rapidQuestions.length}</span><h4>{rapidQuestions[rapidIndex].question}</h4><div className="choice-row">{rapidQuestions[rapidIndex].options.map((option) => <button key={option} className={rapidChoice === option ? 'chosen' : ''} onClick={() => pickRapidChoice(option)}>{option} <span>→</span></button>)}</div>{rapidChoice && <p className="choice-reveal">Noted. Lia is judging.</p>}<button className="next-question" onClick={nextRapidQuestion}>Next question ↗</button></div></div><div className={`moment-card ${celebrating ? 'is-celebrating' : ''}`}><p className="eyebrow">MEMORY</p><div className="moment-spark">✦</div><h4>{moments[momentIndex]}</h4><button className="primary-button" onClick={nextMoment}>Another <span>↻</span></button></div><button className="page-next primary-button" onClick={nextPage}>Next <span>→</span></button></section>}

      {page === 8 && <section className="closing-section section-wrap page-screen final-page"><div className="closing-copy"><p className="eyebrow">LAST PAGE</p><h3>The end.<br /><em>for now.</em></h3><p>Once again, happiest birthdayy Russian. May you have an A1 birthday ahead.</p><p>Good food. Crazy memories. Zero boring moments.</p><button className="primary-button" onClick={() => setClosed(true)}>Next: the end <span>→</span></button></div><div className="signature"><span>from,</span><strong>Lia</strong><small>birthday chaos department</small></div></section>}
    </main>
  )
}

export default App
