import { Text } from './Typography';
import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Memorial, MemorialPlan, validPlan } from '../lib/memorials';
import { Sheet, Field, Button, Card, Icon, IconButton, C, s } from './UI';
const EMPTY: MemorialPlan = { menu: '', guests: '', calls: '', budget: 0, tasks: [], expenses: [] };
export function MemorialPlanner({ memorial, year, onSave, onClose }: { memorial: Memorial; year: number; onSave: (m: Memorial) => Promise<void>; onClose: () => void }) {
  const [plan, setPlan] = useState<MemorialPlan>(memorial.plans?.[year] ?? EMPTY);
  const [task, setTask] = useState(''), [expense, setExpense] = useState(''), [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [changed, setChanged] = useState(false), [confirmClose, setConfirmClose] = useState(false);
  const update = (next: MemorialPlan) => { setPlan(next); setChanged(true); };
  const total = plan.expenses.reduce((sum, e) => sum + e.amount, 0);
  const money = (v: number) => `${v.toLocaleString('vi-VN')} đ`;
  const save = async () => { if (!validPlan(plan)) { setError('Kiểm tra lại số tiền và nội dung. Mỗi danh sách tối đa 100 mục.'); return; } setBusy(true); try { await onSave({ ...memorial, plans: { ...memorial.plans, [year]: plan } }); setChanged(false); onClose(); } catch { setError('Chưa lưu được sổ chuẩn bị. Vui lòng thử lại.'); } finally { setBusy(false); } };
  return <Sheet visible title={`Sổ chuẩn bị giỗ ${year}`} onClose={() => { if (!busy) { if (changed) setConfirmClose(true); else onClose(); } }}>
    <Text style={s.sectionTitle}>{memorial.name}</Text><Text style={s.small}>Mỗi năm có một sổ riêng để lưu lại việc gia đình.</Text>
    <Field label="Thực đơn, lễ vật" value={plan.menu} onChangeText={menu => update({ ...plan, menu })} multiline placeholder="Các món ăn và đồ cần chuẩn bị…" maxLength={5000} />
    <Field label="Danh sách khách mời" value={plan.guests} onChangeText={guests => update({ ...plan, guests })} multiline placeholder="Tên người thân, số người dự kiến…" maxLength={5000} />
    <Field label="Người cần gọi nhắc" value={plan.calls} onChangeText={calls => update({ ...plan, calls })} multiline placeholder="Tên, số điện thoại, thời gian cần liên hệ…" maxLength={5000} />
    <Text style={s.sectionTitle}>Việc cần làm · {plan.tasks.filter(t => t.done).length}/{plan.tasks.length}</Text>
    {plan.tasks.map((t, i) => <View key={i} style={s.row}><Pressable accessibilityRole="checkbox" accessibilityLabel={t.label} accessibilityState={{ checked: t.done }} aria-checked={t.done} onPress={() => update({ ...plan, tasks: plan.tasks.map((x, j) => j === i ? { ...x, done: !x.done } : x) })} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 }}><Icon name={t.done ? 'checkbox' : 'square-outline'} color={C.green} /><Text style={[s.bodyStrong, { flex: 1 }, t.done && { textDecorationLine: 'line-through', color: C.muted }]}>{t.label}</Text></Pressable><IconButton name="close" label={`Xóa việc ${t.label}`} onPress={() => update({ ...plan, tasks: plan.tasks.filter((_, j) => j !== i) })} /></View>)}
    <Field label="Thêm việc cần làm" value={task} onChangeText={setTask} placeholder="Ví dụ: Mua hoa" maxLength={200} /><Button secondary icon="add" disabled={!task.trim() || plan.tasks.length >= 100} onPress={() => { update({ ...plan, tasks: [...plan.tasks, { label: task.trim(), done: false }] }); setTask(''); }}>Thêm việc</Button>
    <Text style={s.sectionTitle}>Chi phí gia đình</Text><Field label="Ngân sách dự kiến (đồng)" value={String(plan.budget || '')} onChangeText={v => update({ ...plan, budget: Number(v.replace(/[^0-9]/g, '')) })} numeric maxLength={13} />
    {plan.expenses.map((e, i) => <View key={i} style={s.row}><Text style={[s.body, { flex: 1 }]}>{e.label}</Text><Text style={s.bodyStrong}>{money(e.amount)}</Text><IconButton name="close" label={`Xóa chi phí ${e.label}`} onPress={() => update({ ...plan, expenses: plan.expenses.filter((_, j) => j !== i) })} /></View>)}
    <Field label="Nội dung chi" value={expense} onChangeText={setExpense} placeholder="Ví dụ: Hoa và trái cây" maxLength={200} /><Field label="Số tiền (đồng)" value={amount} onChangeText={v => setAmount(v.replace(/[^0-9]/g, ''))} numeric maxLength={13} /><Button secondary icon="add" disabled={!expense.trim() || !amount || +amount > 1e12 || plan.expenses.length >= 100} onPress={() => { update({ ...plan, expenses: [...plan.expenses, { label: expense.trim(), amount: +amount }] }); setExpense(''); setAmount(''); }}>Thêm khoản chi</Button>
    <Card style={{ backgroundColor: C.pale }}><Text style={s.bodyStrong}>Đã chi: {money(total)}</Text>{plan.budget > 0 && <Text style={s.body}>{total <= plan.budget ? 'Còn lại' : 'Vượt ngân sách'}: {money(Math.abs(plan.budget - total))}</Text>}</Card>
    {!!error && <Text style={s.error}>{error}</Text>}<Button icon="checkmark" disabled={busy} onPress={() => { void save(); }}>Lưu sổ chuẩn bị</Button>
    {confirmClose && <Card><Text style={s.bodyStrong}>Sổ có thay đổi chưa lưu.</Text><Button onPress={() => { void save(); }} disabled={busy}>Lưu và đóng</Button><Button secondary onPress={onClose}>Bỏ thay đổi và đóng</Button><Button secondary onPress={() => setConfirmClose(false)}>Tiếp tục sửa</Button></Card>}
  </Sheet>;
}
