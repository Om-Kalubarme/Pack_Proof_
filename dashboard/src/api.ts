const API_BASE = "http://localhost:5001/api/v1";

export async function assignCase(payload: any) {
  const response = await fetch(`${API_BASE}/cases/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.json();
}

export async function fetchAssignments(inspectorId?: string) {
  const url = inspectorId 
    ? `${API_BASE}/cases/my-assignments?inspector_id=${inspectorId}`
    : `${API_BASE}/cases/my-assignments`;
  const response = await fetch(url);
  return response.json();
}

export async function reviewPackage(caseId: string) {
  const response = await fetch(`${API_BASE}/cases/${caseId}/review-package`);
  return response.json();
}
