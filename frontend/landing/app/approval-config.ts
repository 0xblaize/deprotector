export type ApprovalTarget = { token: string; symbol: string; spender: string; kind: 'erc20' | 'nft'; label: string };

export const APPROVAL_TARGETS: ApprovalTarget[] = (process.env.NEXT_PUBLIC_APPROVAL_TARGETS || '').split(',').map(value => value.trim()).filter(Boolean).map((value, index) => {
  const [token, spender, symbol = 'TOKEN'] = value.split(':');
  return { token, spender, symbol, kind: 'erc20', label: `Configured token ${index + 1}` };
});
