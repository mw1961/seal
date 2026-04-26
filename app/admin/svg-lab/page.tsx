'use client';

import { useState } from 'react';

const C = {
  bg: '#F8F5F0', surface: '#FFFFFF', border: '#DDD8D0',
  gold: '#8B7355', text: '#1C1A17', muted: '#B0A898', sub: '#7A7060',
};

const SHAPES  = ['circle', 'square', 'triangle'];
const STYLES  = ['japanese', 'modern', 'ancient', 'abstract'];
const COLORS  = ['#000000', '#191970', '#8B0000', '#1B4332'];
const VALUES  = ['Resilience', 'Freedom', 'Harmony', 'Loyalty', 'Wisdom', 'Courage', 'Creativity', 'Justice'];

export default function SvgLabPage() {
  const [origin,     setOrigin]     = useState('Canada');
  const [occupation, setOccupation] = useState('Carpenters');
  const [values,     setValues]     = useState<string[]>(['Resilience', 'Loyalty']);
  const [shape,      setShape]      = useState('circle');
  const [style,      setStyle]      = useState('japanese');
  const [color,      setColor]      = useState('#000000');
  const [svg,        setSvg]        = useState('');
  const [svgCode,    setSvgCode]    = useState('');
  const [symbols,    setSymbols]    = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [history,    setHistory]    = useState<string[]>([]);

  async function generate() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/generate-seal-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, occupation, values, shape, style, color }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSvg(data.svg);
      setSvgCode(data.svg);
      setSymbols(data.symbols);
      setHistory(h => [data.svg, ...h].slice(0, 12));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  function applyEdit() {
    setSvg(svgCode);
    setHistory(h => [svgCode, ...h].slice(0, 12));
  }

  return (
    <main style={{ minHeight: '100vh', background: C.bg, padding: '32px 24px', fontFamily: 'Georgia, serif', color: C.text }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, borderBottom: `1px solid ${C.border}`, paddingBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: '0.4em', margin: 0 }}>SYGNEO</h1>
            <p style={{ fontSize: 10, letterSpacing: '0.3em', color: C.gold, textTransform: 'uppercase', margin: '4px 0 0', fontFamily: 'Helvetica, Arial, sans-serif' }}>SVG Design Lab — Haiku Model</p>
          </div>
          <a href="/admin/dashboard" style={{ fontSize: 11, color: C.muted, textDecoration: 'none', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Helvetica, Arial, sans-serif' }}>← Dashboard</a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>

          {/* Left — Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Origin */}
            <div>
              <label style={{ fontSize: 9, letterSpacing: '0.25em', color: C.muted, textTransform: 'uppercase', fontFamily: 'Helvetica, Arial, sans-serif', display: 'block', marginBottom: 8 }}>Origin</label>
              <input value={origin} onChange={e => setOrigin(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 14, fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* Occupation */}
            <div>
              <label style={{ fontSize: 9, letterSpacing: '0.25em', color: C.muted, textTransform: 'uppercase', fontFamily: 'Helvetica, Arial, sans-serif', display: 'block', marginBottom: 8 }}>Craft / Occupation</label>
              <input value={occupation} onChange={e => setOccupation(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 14, fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* Values */}
            <div>
              <label style={{ fontSize: 9, letterSpacing: '0.25em', color: C.muted, textTransform: 'uppercase', fontFamily: 'Helvetica, Arial, sans-serif', display: 'block', marginBottom: 8 }}>Values (select 2-3)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {VALUES.map(v => {
                  const active = values.includes(v);
                  return (
                    <button key={v} onClick={() => setValues(prev => active ? prev.filter(x => x !== v) : [...prev, v].slice(0, 3))}
                      style={{ padding: '6px 12px', border: `1px solid ${active ? C.gold : C.border}`, background: active ? 'rgba(139,115,85,0.1)' : 'transparent', color: active ? C.text : C.sub, fontSize: 12, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shape */}
            <div>
              <label style={{ fontSize: 9, letterSpacing: '0.25em', color: C.muted, textTransform: 'uppercase', fontFamily: 'Helvetica, Arial, sans-serif', display: 'block', marginBottom: 8 }}>Shape</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {SHAPES.map(s => (
                  <button key={s} onClick={() => setShape(s)}
                    style={{ flex: 1, padding: '9px', border: `1px solid ${shape === s ? C.gold : C.border}`, background: shape === s ? 'rgba(139,115,85,0.1)' : 'transparent', color: shape === s ? C.text : C.sub, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'Georgia, serif' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div>
              <label style={{ fontSize: 9, letterSpacing: '0.25em', color: C.muted, textTransform: 'uppercase', fontFamily: 'Helvetica, Arial, sans-serif', display: 'block', marginBottom: 8 }}>Style</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {STYLES.map(s => (
                  <button key={s} onClick={() => setStyle(s)}
                    style={{ padding: '8px 14px', border: `1px solid ${style === s ? C.gold : C.border}`, background: style === s ? 'rgba(139,115,85,0.1)' : 'transparent', color: style === s ? C.text : C.sub, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'Georgia, serif' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label style={{ fontSize: 9, letterSpacing: '0.25em', color: C.muted, textTransform: 'uppercase', fontFamily: 'Helvetica, Arial, sans-serif', display: 'block', marginBottom: 8 }}>Ink Color</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: `3px solid ${color === c ? C.gold : 'transparent'}`, cursor: 'pointer' }} />
                ))}
              </div>
            </div>

            {/* Symbol preview */}
            {symbols && (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 12 }}>
                <p style={{ fontSize: 9, letterSpacing: '0.2em', color: C.gold, textTransform: 'uppercase', margin: '0 0 6px', fontFamily: 'Helvetica, Arial, sans-serif' }}>Symbol Vocabulary</p>
                <p style={{ fontSize: 11, color: C.sub, margin: 0, lineHeight: 1.6 }}>{symbols}</p>
              </div>
            )}

            {/* Generate */}
            <button onClick={generate} disabled={loading}
              style={{ padding: '14px', border: 'none', background: loading ? C.muted : C.gold, color: '#fff', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 500 }}>
              {loading ? 'Generating...' : '↻ Generate Mark'}
            </button>

            {error && <p style={{ color: '#A0522D', fontSize: 12 }}>{error}</p>}
          </div>

          {/* Right — Preview + Editor + History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Main preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ border: `1px solid ${C.border}`, background: C.surface, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
                {svg
                  ? <div style={{ width: 200, height: 200 }} dangerouslySetInnerHTML={{ __html: svg }} />
                  : <p style={{ color: C.muted, fontSize: 12, fontFamily: 'Helvetica, Arial, sans-serif', letterSpacing: '0.1em' }}>No mark yet</p>
                }
              </div>

              {/* SVG code editor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 9, letterSpacing: '0.25em', color: C.muted, textTransform: 'uppercase', fontFamily: 'Helvetica, Arial, sans-serif' }}>Edit SVG Code</label>
                <textarea value={svgCode} onChange={e => setSvgCode(e.target.value)}
                  rows={10}
                  style={{ flex: 1, padding: 10, border: `1px solid ${C.border}`, background: '#1C1A17', color: '#8B7355', fontSize: 10, fontFamily: 'monospace', resize: 'none', outline: 'none', lineHeight: 1.5 }} />
                <button onClick={applyEdit}
                  style={{ padding: '9px', border: `1px solid ${C.border}`, background: 'transparent', color: C.sub, fontSize: 11, letterSpacing: '0.2em', cursor: 'pointer', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                  Apply Edit
                </button>
              </div>
            </div>

            {/* History */}
            {history.length > 1 && (
              <div>
                <p style={{ fontSize: 9, letterSpacing: '0.25em', color: C.muted, textTransform: 'uppercase', margin: '0 0 12px', fontFamily: 'Helvetica, Arial, sans-serif' }}>History</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {history.slice(1).map((h, i) => (
                    <button key={i} onClick={() => { setSvg(h); setSvgCode(h); }}
                      style={{ width: 80, height: 80, border: `1px solid ${C.border}`, background: C.surface, padding: 6, cursor: 'pointer' }}>
                      <div dangerouslySetInnerHTML={{ __html: h }} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
