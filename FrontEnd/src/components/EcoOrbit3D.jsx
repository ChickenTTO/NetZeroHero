import TiltSurface from './TiltSurface'
import './EcoOrbit3D.css'

function MaterialIcon({ type }) {
  return <svg aria-hidden="true" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {type === 'source' && <><path d="m5 12 11-7 11 7v15H5Z" /><path d="M11 27V17h10v10M4 12h24M12 9V5h8v4" /></>}
    {type === 'transport' && <><path d="M3 8h17v16H3ZM20 14h5l4 6v4h-9" /><path d="M22 14v7h7" /><circle cx="8" cy="25" r="3" /><circle cx="24" cy="25" r="3" /></>}
    {type === 'recycle' && <><path d="m11 10 4-6 5 8M16 11l4 1 2-4M25 16l4 7-9 1M23 20l-3 4 3 3M16 27H7l4-8M12 23l-1-4-5-1" /></>}
  </svg>
}

const nodes = [
  { name: 'Nguồn thải', icon: 'source', position: 'source' },
  { name: 'Vận tải', icon: 'transport', position: 'transport' },
  { name: 'Tái chế', icon: 'recycle', position: 'recycle' },
]

export default function EcoOrbit3D({ selected = 0, onSelect }) {
  return <div className="eco3d-scene" role="group" aria-label="Chọn mắt xích trong hệ sinh thái">
    <span className="eco3d-kicker">HỆ SINH THÁI KẾT NỐI</span>
    <TiltSurface className="eco3d-tilt" maxTilt={0}>
      <div className="eco3d-world">
        <span className="eco3d-ground-shadow" />
        <div className="eco3d-deck">
          <span className="eco3d-base" />
          <span className="eco3d-deck-top" />
          <span className="eco3d-ring ring-edge" />
          <span className="eco3d-ring ring-outer" />
          <span className="eco3d-ring ring-inner" />
          <span className="eco3d-track track-one" />
          <span className="eco3d-track track-two" />
          <span className="eco3d-track track-three" />
          <span className="eco3d-dock" />
          {nodes.map((node, index) => <span className={`eco3d-contact contact-${node.position}${selected === index ? ' is-selected' : ''}`} key={node.name} />)}
        </div>
        <div className="eco3d-core-anchor"><div className="eco3d-core"><span className="eco3d-core-grid" /><span className="eco3d-core-reflection" /><strong>ReLoop</strong><span className="eco3d-core-country">VIETNAM</span></div></div>
        {nodes.map((node, index) => <button type="button" className={`eco3d-anchor eco3d-${node.position}${selected === index ? ' is-selected' : ''}`} key={node.name} aria-label={node.name} aria-pressed={selected === index} aria-controls="audience-description" onClick={() => onSelect?.(index)}>
          <span className="eco3d-node-stem" />
          <span className="eco3d-node"><span className="eco3d-node-tile"><MaterialIcon type={node.icon} /></span><strong>{node.name}</strong></span>
        </button>)}
      </div>
    </TiltSurface>
    <span className="eco3d-caption">Một kết nối. Nhiều vòng đời mới.</span>
  </div>
}
