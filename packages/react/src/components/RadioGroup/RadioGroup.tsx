import { type ChangeEvent } from 'react';

export interface RadioOption { value: string; label: string; }

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
}

export function RadioGroup({ name, options, value, onChange, label }: RadioGroupProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value);
  return (
    <fieldset className="lds-radio-group" style={{ border: 'none', padding: 0 }}>
      {label && <legend style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)', marginBottom: 8 }}>{label}</legend>}
      {options.map(o => (
        <label key={o.value} className="lds-radio">
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={handleChange}
          />
          <span className="lds-radio__label">{o.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
