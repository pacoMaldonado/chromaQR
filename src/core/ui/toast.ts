let toastTimeout: ReturnType<typeof setTimeout> | null = null;

export type ToastVariant = 'success' | 'warning' | 'info';

export function showToast(
  message: string,
  variant: ToastVariant = 'success',
  durationMs: number = 2800
): void {
  const toastEl = document.getElementById('app-toast');
  const msgEl = document.getElementById('app-toast-message');
  const iconSuccess = document.getElementById('app-toast-icon-success');
  const iconWarning = document.getElementById('app-toast-icon-warning');
  const iconInfo = document.getElementById('app-toast-icon-info');

  if (!toastEl || !msgEl) return;

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  msgEl.textContent = message;
  iconSuccess?.classList.toggle('hidden', variant !== 'success');
  iconWarning?.classList.toggle('hidden', variant !== 'warning');
  iconInfo?.classList.toggle('hidden', variant !== 'info');

  toastEl.classList.remove('hidden');
  toastEl.classList.add('flex');

  toastTimeout = setTimeout(() => {
    toastEl.classList.add('hidden');
    toastEl.classList.remove('flex');
  }, durationMs);
}
