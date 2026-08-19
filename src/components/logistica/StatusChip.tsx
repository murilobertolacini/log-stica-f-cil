import { STATUS_LABEL, type ServiceStatus } from "@/lib/logistica/types";

export function StatusChip({ status }: { status: ServiceStatus }) {
  return (
    <span className="status-chip" data-status={status}>
      {STATUS_LABEL[status]}
    </span>
  );
}