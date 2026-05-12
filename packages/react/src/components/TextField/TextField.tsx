import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, hint, error, id, className, ...props }, ref) => {
    const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="lds-field">
        {label && <label className="lds-field__label" htmlFor={fieldId}>{label}</label>}
        <input
          ref={ref}
          id={fieldId}
          className={cn('lds-field__input', error && 'lds-field__input--error', className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-err` : hint ? `${fieldId}-hint` : undefined}
          {...props}
        />
        {hint  && !error && <span id={`${fieldId}-hint`}  className="lds-field__hint">{hint}</span>}
        {error &&           <span id={`${fieldId}-err`}   className="lds-field__error" role="alert">{error}</span>}
      </div>
    );
  },
);
TextField.displayName = 'TextField';
