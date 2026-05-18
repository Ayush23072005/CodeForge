import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md', text = '' }) => {
  return (
    <div className={`spinner-wrapper spinner-${size}`}>
      <div className="spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <span className="spinner-icon">⚡</span>
      </div>
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
