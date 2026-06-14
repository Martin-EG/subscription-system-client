import styled from 'styled-components'

const Button = styled.button<{ $secondary?: boolean }>`
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid ${({ $secondary }) => ($secondary ? '#d8dee9' : '#67e8f9')};
  border-radius: 0.8rem;
  background: ${({ $secondary }) => ($secondary ? '#ffffff' : '#67e8f9')};
  color: #0f172a;
  padding: 0.7rem 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    opacity 160ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(8, 145, 178, 0.16);
  }

  &:focus-visible {
    outline: 3px solid rgba(34, 211, 238, 0.35);
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export default Button;
