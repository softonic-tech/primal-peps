/** Shared admin UI primitives — loading, empty, select, stars */

export function LoadingBlock({ label = 'Loading…' }) {
  return (
    <div className="ui-loading" role="status" aria-live="polite">
      <span className="ui-spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="ui-empty">
      <strong>{title}</strong>
      {body && <p>{body}</p>}
      {action}
    </div>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  id,
}) {
  return (
    <label className="ui-select-field">
      {label && <span>{label}</span>}
      <div className="ui-select-wrap">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const v = typeof opt === 'string' ? opt : opt.value
            const text = typeof opt === 'string' ? opt : opt.label
            return (
              <option key={v} value={v}>
                {text}
              </option>
            )
          })}
        </select>
        <span className="ui-select-chevron" aria-hidden="true">
          ▾
        </span>
      </div>
    </label>
  )
}

export function Stars({ value = 0 }) {
  const n = Math.min(5, Math.max(0, Number(value) || 0))
  return (
    <span className="ui-stars" aria-label={`${n} out of 5`}>
      {'★'.repeat(n)}
      <span className="ui-stars-empty">{'★'.repeat(5 - n)}</span>
    </span>
  )
}

export function SearchInput({ value, onChange, placeholder, ariaLabel }) {
  return (
    <div className="ui-search">
      <span className="ui-search-icon" aria-hidden="true">
        ⌕
      </span>
      <input
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder}
      />
      {value ? (
        <button
          type="button"
          className="ui-search-clear"
          aria-label="Clear search"
          onClick={() => onChange('')}
        >
          ✕
        </button>
      ) : null}
    </div>
  )
}
