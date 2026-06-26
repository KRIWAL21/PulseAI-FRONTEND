const Spinner = ({ size = 24 }: { size?: number }) => (
  <div
    className="spinner"
    style={{ width: size, height: size }}
    role="status"
    aria-label="Loading"
  />
);

export default Spinner;