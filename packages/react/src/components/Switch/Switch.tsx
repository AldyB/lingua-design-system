import { cn } from '../../lib/utils';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

export function Switch({ checked, onChange, label, disabled, id }: SwitchProps) {
  const switchId = id ?? 'switch';
  return (
    <label className={cn('lds-switch', disabled && 'lds-switch--disabled')} htmlFor={switchId} style={disabled ? { opacity: 0.5 } : undefined}>
      <span
        className={cn('lds-switch__track', checked && 'lds-switch__track--on')}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span className="lds-switch__thumb" />
      </span>
      {label && <span className="lds-switch__label">{label}</span>}
      <input
        type="checkbox"
        id={switchId}
        role="switch"
        aria-checked={checked}
        checked={checked}
        disabled={disabled}
        onChange={e => onChange(e.target.checked)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
      />
    </label>
  );
}
