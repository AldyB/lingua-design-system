import { forwardRef, type InputHTMLAttributes } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, id, ...props }, ref) => {
    const fieldId = id ?? `ck-${label.toLowerCase().replace(/\s+/g, '-')}`;
    return (
      <label className="lds-checkbox" htmlFor={fieldId}>
        <input ref={ref} type="checkbox" id={fieldId} {...props} />
        <span className="lds-checkbox__label">{label}</span>
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';
