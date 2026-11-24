export function Icon({ name, fill = false }: { name: string; fill?: boolean }) {
  return <i className={`${fill ? 'ph-fill' : 'ph'} ph-${name}`} aria-hidden="true" />
}
