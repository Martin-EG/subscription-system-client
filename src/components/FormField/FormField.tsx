import { useId, type InputHTMLAttributes, type FC } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const FormField: FC<FormFieldProps> = ({ label, error, ...props }) => {
  const id = useId();
  const errorId = `${id}-error`;

  const errorLabel = error 
  ? (
      <span id={errorId} className="text-xs font-medium text-rose-600">
        {error}
      </span>
    ) 
  : null;

  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700" htmlFor={id}>
      {label}
      <input
        {...props}
        id={id}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className="h-12 rounded-xl border border-slate-200 bg-white px-4 font-normal text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
      />
      {errorLabel}
    </label>
  )
};

export default FormField;