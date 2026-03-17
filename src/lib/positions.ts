import { supabase } from "@/integrations/supabase/client";
import type { Position, PositionFormData, PositionStatus } from "./types";

export async function fetchPositions(): Promise<Position[]> {
  const { data, error } = await supabase
    .from("positions")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Position[];
}

export async function createPosition(form: PositionFormData): Promise<Position> {
  const { data, error } = await supabase
    .from("positions")
    .insert({
      company: form.company,
      role: form.role,
      url: form.url || null,
      status: form.status,
      notes: form.notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Position;
}

export async function updatePosition(id: string, form: Partial<PositionFormData>): Promise<Position> {
  const { data, error } = await supabase
    .from("positions")
    .update(form)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Position;
}

export async function deletePosition(id: string): Promise<void> {
  const { error } = await supabase.from("positions").delete().eq("id", id);
  if (error) throw error;
}

export async function updatePositionStatus(id: string, status: PositionStatus): Promise<Position> {
  return updatePosition(id, { status });
}

// Markdown generation for bidirectional sync
export function positionToMarkdown(p: Position): string {
  return `---
id: ${p.id}
company: "${p.company}"
role: "${p.role}"
status: ${p.status}
url: "${p.url || ''}"
created_at: ${p.created_at}
updated_at: ${p.updated_at}
---

# ${p.role} @ ${p.company}

**Status:** ${p.status}
${p.url ? `**URL:** [Link](${p.url})` : ''}

## Notes

${p.notes || '_No notes yet._'}
`;
}

export function parseMarkdownPosition(content: string): Partial<PositionFormData> & { id?: string } {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return {};

  const fm = frontmatterMatch[1];
  const get = (key: string) => {
    const match = fm.match(new RegExp(`^${key}:\\s*"?(.+?)"?$`, 'm'));
    return match?.[1]?.trim() || undefined;
  };

  const notesMatch = content.match(/## Notes\n\n([\s\S]*?)$/);
  const notes = notesMatch?.[1]?.trim();

  return {
    id: get('id'),
    company: get('company') || '',
    role: get('role') || '',
    url: get('url'),
    status: (get('status') as PositionStatus) || 'bookmarked',
    notes: notes && notes !== '_No notes yet._' ? notes : undefined,
  };
}

export function generateAllMarkdown(positions: Position[]): string {
  return positions.map(positionToMarkdown).join('\n---\n\n');
}
