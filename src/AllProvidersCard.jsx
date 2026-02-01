export default function AllProvidersCard({ total, open }) {
  return (
    <div className="card" onClick={open}>
      <h3>All Providers</h3>
      <p>{total} Total Patient Notes</p>
    </div>
  );
}
