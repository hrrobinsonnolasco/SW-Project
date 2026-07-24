import { useState } from 'react'

function generateStreamId() {
  return crypto.randomUUID().slice(0, 8)
}

export default function EmitterPage() {
  const [streamId, setStreamId] = useState(null)
  const [isSharing, setIsSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = streamId
    ? `${window.location.origin}/stream/${streamId}`
    : ''

  function handleStart() {
    const id = generateStreamId()
    setStreamId(id)
    setIsSharing(true)
  }

  function handleStop() {
    setIsSharing(false)
    setStreamId(null)
    setCopied(false)
  }

  async function handleCopyLink() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-svh bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-svh max-w-2xl flex-col px-6 py-12">
        <header className="mb-10">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
            Share Window
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Compartir pantalla
          </h1>
          <p className="mt-3 text-slate-400">
            Selecciona una ventana o pantalla y comparte el enlace con quien quieras ver la
            transmisión.
          </p>
        </header>

        <section className="flex flex-1 flex-col gap-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
          <div className="flex items-center justify-between rounded-xl bg-slate-950/80 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Estado</p>
              <p className="font-medium text-white">
                {isSharing ? 'Transmitiendo' : 'Inactivo'}
              </p>
            </div>
            <span
              className={`h-3 w-3 rounded-full ${
                isSharing ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]' : 'bg-slate-600'
              }`}
            />
          </div>

          {!isSharing ? (
            <button
              type="button"
              onClick={handleStart}
              className="rounded-xl bg-indigo-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-indigo-400"
            >
              Iniciar transmisión
            </button>
          ) : (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={handleStop}
                className="rounded-xl border border-red-500/40 bg-red-500/10 px-6 py-3 font-medium text-red-300 transition hover:bg-red-500/20"
              >
                Detener transmisión
              </button>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="mb-2 text-sm text-slate-400">Enlace para compartir</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                  >
                    {copied ? 'Copiado' : 'Copiar enlace'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-slate-500">
            {isSharing
              ? 'Envía el enlace por mensajería. El receptor podrá ver la transmisión al abrirlo.'
              : 'Al iniciar se generará un enlace único para esta sesión.'}
          </p>
        </section>
      </div>
    </div>
  )
}
