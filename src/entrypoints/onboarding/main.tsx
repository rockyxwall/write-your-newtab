import { createRoot } from 'react-dom/client'
import { Sparkles, Upload, LayoutGrid, Zap, ArrowRight, Library, Code2 } from 'lucide-react'
import '@/assets/tailwind.css'

function Onboarding() {
  const openDashboard = () => {
    browser.tabs.create({ url: browser.runtime.getURL('/dashboard.html') })
    window.close()
  }

  return (
    <div className="dark">
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 font-sans text-center">
        <div className="max-w-3xl w-full space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="bg-primary p-4 rounded-2xl shadow-2xl shadow-primary/20">
            <img src="/icon/128.png" className="w-12 h-12 brightness-0 invert dark:invert-0" alt="WYNTab" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter italic uppercase">WYNT<span className="lowercase">ab</span></h1>
          <p className="text-muted-foreground text-lg font-medium uppercase tracking-[0.2em]">Write Your NewTab</p>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            <div className="flex flex-col items-center gap-5 p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <Library className="text-primary" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold uppercase text-[10px] tracking-[0.2em] text-primary">Pick a Base</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Start with our built-in minimalist templates.</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-5 p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <Code2 className="text-primary" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold uppercase text-[10px] tracking-[0.2em] text-primary">Upload HTML</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Upload your own HTML/CSS for total control.</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-5 p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <Zap className="text-primary" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold uppercase text-[10px] tracking-[0.2em] text-primary">Instant Sync</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Your changes apply instantly to every new tab.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <button
              onClick={openDashboard}
              className="group inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm h-14 px-10 shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Get Started
              <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Click the extension icon anytime to open the dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<Onboarding />)
