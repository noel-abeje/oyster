import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle, X, XCircle } from 'react-feather';
import { match } from 'ts-pattern';

import { useHydrated } from '../hooks/use-hydrated';
import { cx } from '../utils/cx';
import { IconButton } from './icon-button';
import { Text } from './text';

export type ToastProps = {
  message: string;
  type: 'error' | 'success' | 'warning';
};

const iconClassName = 'h-4 w-4 text-white';

const Icon: Record<ToastProps['type'], JSX.Element> = {
  error: <XCircle className={iconClassName} />,
  success: <CheckCircle className={iconClassName} />,
  warning: <AlertCircle className={iconClassName} />,
};

export function Toast({ message, type }: ToastProps): JSX.Element | null {
  const [show, setShow] = useState<boolean>(true);

  const hydrated = useHydrated();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(false);
    }, 7000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  if (!show) {
    return null;
  }

  if (!hydrated) {
    return null;
  }

  function onClickClose() {
    setShow(false);
  }

  return createPortal(
    <aside
      className={cx(
        'fixed bottom-4 left-4 box-border flex w-max max-w-[calc(100vw-2rem)] items-center gap-2 rounded-lg bg-slate-900 p-2 text-center text-white',
        'animate-[toast-animation_500ms_forwards]'
      )}
      role="alert"
    >
      <div
        className={cx(
          'relative box-border flex items-center justify-center rounded p-1',

          match(type)
            .with('error', () => 'bg-error')
            .with('success', () => 'bg-success')
            .with('warning', () => 'bg-warning')
            .exhaustive()
        )}
      >
        {Icon[type]}
        <span
          className={cx(
            'absolute left-0 top-0 h-full w-full bg-[#00000026]',
            'animate-[toast-shader-animation_7s_ease-in-out]'
          )}
        />
      </div>

      <Text color="white" variant="sm">
        {message}
      </Text>

      <IconButton
        className="h-6 w-6 text-white"
        label="Close Toast Button"
        icon={<X className="h-5 w-5" />}
        onClick={onClickClose}
      />
    </aside>,

    document.body
  );
}
