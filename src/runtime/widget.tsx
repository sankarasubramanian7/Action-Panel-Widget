/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/** @jsx jsx */
import {
  React,
  jsx,
  type AllWidgetProps
} from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import type { IMConfig } from '../config'

const { useState, useCallback, useRef } = React

/* ═══════════════════ COLORS & STYLES ═══════════════════ */
const C = {
  bg: '#0f1923', panel: '#152030', card: '#1a2733', cardHover: '#1e3040',
  accent: '#00d4ff', accentAlt: '#7c4dff', success: '#00e676',
  warning: '#ffab40', danger: '#ff5252', text: '#e0e8f0',
  textDim: '#8899aa', border: '#2a3a4a', divider: 'rgba(255,255,255,0.06)'
}

const S: Record<string, React.CSSProperties> = {
  root: {
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    background: `linear-gradient(170deg, ${C.bg} 0%, #0d1520 100%)`,
    color: C.text, overflow: 'hidden', position: 'relative'
  },
  header: {
    padding: '18px 20px 14px', borderBottom: `1px solid ${C.divider}`,
    background: 'linear-gradient(135deg, rgba(0,212,255,0.05) 0%, rgba(124,77,255,0.05) 100%)'
  },
  title: {
    margin: 0, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10
  },
  icon: {
    width: 28, height: 28, borderRadius: 8,
    background: 'linear-gradient(135deg, #00d4ff, #7c4dff)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, color: '#fff', fontWeight: 800
  },
  sub: { margin: '4px 0 0', fontSize: 11 },
  body: { flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 16 },
  section: { background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' },
  sHead: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
    fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const,
    letterSpacing: 1, borderBottom: `1px solid ${C.divider}`
  },
  sBody: { padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 },
  btn: {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
    padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`,
    background: C.panel, color: C.text, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' as const
  },
  btnIcon: {
    width: 26, height: 26, borderRadius: 6, display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0
  },
  badge: {
    padding: '2px 7px', borderRadius: 6, fontSize: 9,
    fontWeight: 700, textTransform: 'uppercase' as const, flexShrink: 0
  },
  toast: {
    position: 'absolute' as const, bottom: 14, left: 14, right: 14,
    padding: '10px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
    boxShadow: '0 6px 24px rgba(0,0,0,0.5)', zIndex: 100,
    display: 'flex', alignItems: 'center', gap: 8,
    animation: 'apFadeIn 0.25s ease'
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100%', gap: 12, textAlign: 'center', padding: 30
  }
}

/* ═══════════════════ HELPERS ═══════════════════ */

function findLayers (view: __esri.MapView, keywords: string[]): __esri.Layer[] {
  return view.map.allLayers.toArray().filter(layer => {
    const t = (layer.title || '').toLowerCase()
    return keywords.some(k => t.includes(k.toLowerCase()))
  })
}

function featureLayers (view: __esri.MapView): __esri.FeatureLayer[] {
  return view.map.allLayers.filter(l => l.type === 'feature').toArray() as __esri.FeatureLayer[]
}

/* ═══════════════════ SECTIONS ═══════════════════ */
const SECTIONS = [
  {
    id: 'map', title: 'Map Controls', icon: '🗺️', color: C.accent,
    buttons: [
      { id: 'zoom-sub', label: 'Zoom to Substations', icon: '🔍', bg: 'linear-gradient(135deg,#00d4ff,#0097a7)' },
      { id: 'ht', label: 'Toggle HT Lines', icon: '⚡', bg: 'linear-gradient(135deg,#ffab40,#ff6f00)' },
      { id: 'lt', label: 'Toggle LT Lines', icon: '🔌', bg: 'linear-gradient(135deg,#7c4dff,#b388ff)' },
      { id: 'clear', label: 'Clear Selection', icon: '✖', bg: 'linear-gradient(135deg,#ff5252,#d32f2f)' }
    ]
  },
  {
    id: 'net', title: 'Network Operations', icon: '🔗', color: C.success,
    buttons: [
      { id: 'feeder', label: 'Find Feeder', icon: '🔎', bg: 'linear-gradient(135deg,#00e676,#00c853)' }
    ]
  },
  {
    id: 'analysis', title: 'Analysis', icon: '📊', color: C.accentAlt,
    buttons: [
      { id: 'analyze', label: 'Run Analysis', icon: '🧪', bg: 'linear-gradient(135deg,#7c4dff,#e040fb)' },
      { id: 'validate', label: 'Validate Data', icon: '✅', bg: 'linear-gradient(135deg,#26c6da,#00acc1)' }
    ]
  }
]

/* ═══════════════════ WIDGET ═══════════════════ */

export default function ActionPanelWidget (props: AllWidgetProps<IMConfig>) {
  const [htOn, setHtOn] = useState(true)
  const [ltOn, setLtOn] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [connected, setConnected] = useState(false)

  const viewRef = useRef<__esri.MapView | null>(null)
  const timer = useRef<any>(null)

  const flash = useCallback((msg: string, ok = true) => {
    if (timer.current) clearTimeout(timer.current)
    setToast({ msg, ok })
    timer.current = setTimeout(() => { setToast(null) }, 3000)
  }, [])

  /* ── Map connection ── */
  const onActiveViewChange = useCallback((jmv: JimuMapView) => {
    if (!jmv?.view) { viewRef.current = null; setConnected(false); return }
    const v = jmv.view as __esri.MapView
    viewRef.current = v
    v.when(() => {
      setConnected(true)
      console.log('[ActionPanel] ✓ Map ready —', v.map.allLayers.length, 'layers')
    }).catch(() => { setConnected(false) })
  }, [])

  /* ── Button actions — each one directly changes the map ── */
  const act = useCallback(async (id: string) => {
    if (busy) return
    const v = viewRef.current
    if (!v) { flash('Map not connected', false); return }

    setBusy(id)
    try {
      switch (id) {

        /* ── Zoom to substations / point layers ── */
        case 'zoom-sub': {
          let layers = findLayers(v, ['substation', 'sub station', 'sub_station'])
          if (!layers.length) layers = featureLayers(v).filter(l => l.geometryType === 'point')
          if (!layers.length) { flash('No substation layers found', false); break }
          const fl = layers[0] as __esri.FeatureLayer
          const ext = await fl.queryExtent()
          if (ext.extent) await v.goTo(ext.extent.expand(1.5), { duration: 1200 })
          flash(`Zoomed to ${fl.title}`)
          break
        }

        /* ── Toggle HT line layers ── */
        case 'ht': {
          let layers = findLayers(v, ['ht ', 'ht_', 'htline', 'ht line', 'high tension', '11kv', '33kv', '66kv', '110kv', '220kv'])
          if (!layers.length) layers = featureLayers(v).filter(l => l.geometryType === 'polyline')
          if (!layers.length) { flash('No HT line layers found', false); break }
          const show = !htOn
          layers.forEach(l => { l.visible = show })
          setHtOn(show)
          flash(`HT Lines ${show ? 'visible' : 'hidden'} (${layers.map(l => l.title).join(', ')})`)
          break
        }

        /* ── Toggle LT line layers ── */
        case 'lt': {
          const layers = findLayers(v, ['lt ', 'lt_', 'ltline', 'lt line', 'low tension'])
          if (!layers.length) { flash('No LT line layers found', false); break }
          const show = !ltOn
          layers.forEach(l => { l.visible = show })
          setLtOn(show)
          flash(`LT Lines ${show ? 'visible' : 'hidden'} (${layers.map(l => l.title).join(', ')})`)
          break
        }

        /* ── Clear selection / graphics / popup ── */
        case 'clear': {
          v.graphics.removeAll()
          if (v.popup?.visible) v.popup.close()
          flash('Cleared all selections')
          break
        }

        /* ── Find feeder — query layers for feeder fields ── */
        case 'feeder': {
          let found = false
          for (const fl of featureLayers(v)) {
            await fl.load()
            const fld = fl.fields?.find(f => {
              const n = f.name.toLowerCase()
              return n.includes('feeder') || n.includes('fdr') || n.includes('circuit')
            })
            if (!fld) continue
            const q = fl.createQuery()
            q.where = `${fld.name} IS NOT NULL`
            q.outFields = ['*']
            q.num = 1
            q.returnGeometry = true
            const res = await fl.queryFeatures(q)
            if (res.features.length) {
              const feat = res.features[0]
              if (feat.geometry) {
                await v.goTo(feat.geometry, { duration: 1000 })
                v.openPopup({ features: [feat], location: (feat.geometry as any).extent?.center || feat.geometry })
              }
              flash(`Feeder: ${feat.attributes[fld.name]} in "${fl.title}"`)
              found = true
              break
            }
          }
          if (!found) flash('No feeder data found in any layer', false)
          break
        }

        /* ── Run analysis — count features per layer ── */
        case 'analyze': {
          const fls = featureLayers(v)
          const counts = await Promise.allSettled(fls.map(async fl => {
            await fl.load()
            return { name: fl.title, count: await fl.queryFeatureCount() }
          }))
          const ok = counts.filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled').map(r => r.value)
          const total = ok.reduce((s, r) => s + r.count, 0)
          console.table(ok)
          flash(`Analysis: ${fls.length} layers, ${total.toLocaleString()} features`)
          break
        }

        /* ── Validate data — check layers for empty data ── */
        case 'validate': {
          const fls = featureLayers(v)
          const checks = await Promise.allSettled(fls.map(async fl => {
            await fl.load()
            return { name: fl.title, count: await fl.queryFeatureCount(), fields: fl.fields?.length }
          }))
          const ok = checks.filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled').map(r => r.value)
          const empty = ok.filter(r => r.count === 0)
          console.table(ok)
          flash(empty.length ? `${empty.length} empty layers found` : `All ${ok.length} layers have data ✓`, empty.length === 0)
          break
        }
      }
    } catch (e: any) {
      console.error('[ActionPanel]', e)
      flash(e.message || 'Something went wrong', false)
    } finally {
      setBusy(null)
    }
  }, [busy, htOn, ltOn, flash])

  /* ═══ NO MAP WIDGET SELECTED ═══ */
  if (!props.useMapWidgetIds || !props.useMapWidgetIds.length) {
    return (
      <div style={S.root}>
        <div style={S.empty}>
          <div style={{ fontSize: 40 }}>🗺️</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>No Map Connected</div>
          <div style={{ fontSize: 12, color: C.textDim, maxWidth: 240 }}>
            Click the ⚙️ settings icon on this widget, then select a Map widget from your page.
          </div>
        </div>
      </div>
    )
  }

  /* ═══ MAIN RENDER ═══ */
  return (
    <div style={S.root}>
      <style>{`
        @keyframes apSpin{to{transform:rotate(360deg)}}
        @keyframes apFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Invisible map hook */}
      <JimuMapViewComponent
        useMapWidgetId={props.useMapWidgetIds[0]}
        onActiveViewChange={onActiveViewChange}
      />

      {/* Header */}
      <div style={S.header}>
        <h3 style={S.title}>
          <span style={S.icon}>⚡</span> Action Panel
        </h3>
        <p style={{ ...S.sub, color: connected ? C.success : C.warning }}>
          {connected ? '● Connected to map' : '● Waiting for map to load...'}
        </p>
      </div>

      {/* Sections */}
      <div style={S.body}>
        {SECTIONS.map(sec => (
          <div key={sec.id} style={S.section}>
            <div style={{ ...S.sHead, color: sec.color }}>
              <span>{sec.icon}</span><span>{sec.title}</span>
            </div>
            <div style={S.sBody}>
              {sec.buttons.map(b => {
                const loading = busy === b.id
                const disabled = (busy !== null && !loading) || !connected
                const isToggle = b.id === 'ht' || b.id === 'lt'
                const isOn = b.id === 'ht' ? htOn : ltOn
                return (
                  <button
                    key={b.id}
                    style={{
                      ...S.btn,
                      opacity: disabled ? 0.4 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      borderColor: loading ? sec.color : C.border
                    }}
                    disabled={disabled}
                    onClick={() => act(b.id)}
                    onMouseEnter={e => { if (!disabled) { const el = e.currentTarget; el.style.background = C.cardHover; el.style.borderColor = sec.color; el.style.transform = 'translateX(3px)' } }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.background = C.panel; el.style.borderColor = loading ? sec.color : C.border; el.style.transform = 'translateX(0)' }}
                  >
                    <span style={{ ...S.btnIcon, background: b.bg }}>{b.icon}</span>
                    <span style={{ flex: 1 }}>{b.label}</span>
                    {isToggle && <span style={{ ...S.badge, background: isOn ? C.success+'22' : C.danger+'22', color: isOn ? C.success : C.danger }}>{isOn ? 'ON' : 'OFF'}</span>}
                    {loading && <span style={{ width:14,height:14,borderRadius:'50%',border:`2px solid ${C.border}`,borderTopColor:sec.color,animation:'apSpin .7s linear infinite',flexShrink:0 }}/>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ ...S.toast, background: toast.ok ? '#0a2a1a' : '#2a0a0a', border: `1px solid ${toast.ok ? C.success : C.danger}`, color: toast.ok ? C.success : C.danger }}>
          <span>{toast.ok ? '✓' : '✕'}</span>
          <span style={{ flex:1, color: C.text }}>{toast.msg}</span>
          <span style={{ cursor:'pointer', opacity:0.5 }} onClick={() => { setToast(null) }}>✕</span>
        </div>
      )}
    </div>
  )
}
