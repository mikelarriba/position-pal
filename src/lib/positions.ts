import { supabase } from "@/integrations/supabase/client";
import type { Position, PositionFormData, PositionStatus, Company, CompanyFormData, CompanyWithPositions, Communication, CommunicationFormData } from "./types";

// ─── Companies ───

export async function fetchCompanies(): Promise<Company[]> {
  const { data, error } = await supabase.from("companies").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as Company[];
}

export async function fetchCompaniesWithPositions(): Promise<CompanyWithPositions[]> {
  const { data, error } = await supabase.from("companies").select("*, positions(*)").order("name");
  if (error) throw error;
  return (data ?? []) as CompanyWithPositions[];
}

export async function createCompany(form: CompanyFormData): Promise<Company> {
  const { data, error } = await supabase
    .from("companies")
    .insert({
      name: form.name,
      website: form.website || null,
      linkedin_url: form.linkedin_url || null,
      description: form.description || null,
      size: form.size || null,
      industry: form.industry || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Company;
}

export async function updateCompany(id: string, form: Partial<CompanyFormData>): Promise<Company> {
  const { data, error } = await supabase.from("companies").update(form).eq("id", id).select().single();
  if (error) throw error;
  return data as Company;
}

export async function deleteCompany(id: string): Promise<void> {
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw error;
}

export async function enrichCompanyData(linkedin_url: string, company_name: string) {
  const { data, error } = await supabase.functions.invoke("enrich-company", {
    body: { linkedin_url, company_name },
  });
  if (error) throw error;
  return data;
}

// ─── Positions ───

export async function fetchPositions(): Promise<Position[]> {
  const { data, error } = await supabase.from("positions").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Position[];
}

export async function createPosition(form: PositionFormData): Promise<Position> {
  const { data, error } = await supabase
    .from("positions")
    .insert({
      company_id: form.company_id,
      company: form.company,
      role: form.role,
      url: form.url || null,
      status: form.status,
      notes: form.notes || null,
      description: form.description || null,
      salary_min: form.salary_min ?? null,
      salary_max: form.salary_max ?? null,
      salary_currency: form.salary_currency || 'EUR',
    })
    .select()
    .single();
  if (error) throw error;
  return data as Position;
}

export async function updatePosition(id: string, form: Partial<PositionFormData>): Promise<Position> {
  const { data, error } = await supabase.from("positions").update(form).eq("id", id).select().single();
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

export async function enrichPositionData(url: string, role: string) {
  const { data, error } = await supabase.functions.invoke("enrich-position", {
    body: { url, role },
  });
  if (error) throw error;
  return data;
}

// ─── Communications ───

export async function fetchCommunications(positionId: string): Promise<Communication[]> {
  const { data, error } = await supabase
    .from("position_communications")
    .select("*")
    .eq("position_id", positionId)
    .order("occurred_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Communication[];
}

export async function fetchCompanyCommunications(companyId: string): Promise<(Communication & { position_role: string })[]> {
  // Get all positions for this company, then get their communications
  const { data: positions, error: posError } = await supabase
    .from("positions")
    .select("id, role")
    .eq("company_id", companyId);
  if (posError) throw posError;
  if (!positions || positions.length === 0) return [];

  const positionIds = positions.map((p) => p.id);
  const { data, error } = await supabase
    .from("position_communications")
    .select("*")
    .in("position_id", positionIds)
    .order("occurred_at", { ascending: true });
  if (error) throw error;

  const roleMap = Object.fromEntries(positions.map((p) => [p.id, p.role]));
  return (data ?? []).map((c) => ({ ...c, position_role: roleMap[c.position_id] || "Unknown" })) as any;
}

export async function createCommunication(form: CommunicationFormData): Promise<Communication> {
  const { data, error } = await supabase
    .from("position_communications")
    .insert({
      position_id: form.position_id,
      message_type: form.message_type,
      author: form.author,
      content: form.content,
      occurred_at: form.occurred_at || new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as Communication;
}

export async function deleteCommunication(id: string): Promise<void> {
  const { error } = await supabase.from("position_communications").delete().eq("id", id);
  if (error) throw error;
}

// ─── Markdown ───

export function positionToMarkdown(p: Position): string {
  const fileId = p.short_id || p.id.slice(0, 4);
  return `---
id: ${p.id}
short_id: ${fileId}
company_id: ${p.company_id}
company: "${p.company}"
role: "${p.role}"
status: ${p.status}
url: "${p.url || ''}"
salary_min: ${p.salary_min ?? ''}
salary_max: ${p.salary_max ?? ''}
salary_currency: ${p.salary_currency || 'EUR'}
created_at: ${p.created_at}
updated_at: ${p.updated_at}
---

# ${p.role} @ ${p.company}

**ID:** ${fileId}
**Status:** ${p.status}
${p.url ? `**URL:** [Link](${p.url})` : ''}
${p.salary_min || p.salary_max ? `**Salary:** ${p.salary_min ?? '?'} - ${p.salary_max ?? '?'} ${p.salary_currency || 'EUR'}` : ''}

## Description

${p.description || '_No description yet._'}

## Notes

${p.notes || '_No notes yet._'}
`;
}

export function positionFileName(p: Position): string {
  return `pos${p.short_id || p.id.slice(0, 4)}.md`;
}

export function downloadPositionMarkdown(p: Position): void {
  const markdown = positionToMarkdown(p);
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = positionFileName(p);
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadAllPositionMarkdowns(positions: Position[]): void {
  positions.forEach((p) => downloadPositionMarkdown(p));
}
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
    company_id: get('company_id') || '',
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
