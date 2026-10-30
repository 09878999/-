import type { Subject } from '../types';

interface SubjectPillsProps {
  subjects: Subject[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

export function SubjectPills({ subjects, value, onChange, disabled = false }: SubjectPillsProps) {
  return (
    <div className="subject-pills" role="radiogroup" aria-label="学习科目">
      {subjects.map((subject) => {
        const selected = subject.id === value;
        return (
          <button
            key={subject.id}
            type="button"
            className={`subject-pill${selected ? ' is-selected' : ''}`}
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(subject.id)}
          >
            <span className="subject-dot" style={{ backgroundColor: subject.color }} />
            {subject.name}
          </button>
        );
      })}
    </div>
  );
}
