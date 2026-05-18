import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { FiSun, FiMoon, FiPlay, FiLogIn, FiLogOut, FiUser, FiChevronDown } from 'react-icons/fi';
import { SiPython } from 'react-icons/si';
import { TbBrandCpp } from 'react-icons/tb';
import { FaJava } from 'react-icons/fa';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Header.css';

const languageOptions = [
  { id: 'python', label: 'Python', icon: <SiPython /> },
  { id: 'cpp', label: 'C++', icon: <TbBrandCpp /> },
  { id: 'java', label: 'Java', icon: <FaJava /> },
];

const Header = ({ language, setLanguage, onRun, isRunning, onAuthClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const currentLang = languageOptions.find((l) => l.id === language);

  return (
    <header className="header" id="main-header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">CodeForge</span>
        </div>

        <div className="language-selector" id="language-selector">
          <div className="language-current">
            <span className="language-icon">{currentLang?.icon}</span>
            <span className="language-label">{currentLang?.label}</span>
            <FiChevronDown className="language-chevron" />
          </div>
          <div className="language-dropdown">
            {languageOptions.map((lang) => (
              <button
                key={lang.id}
                className={`language-option ${language === lang.id ? 'active' : ''}`}
                onClick={() => setLanguage(lang.id)}
                id={`lang-${lang.id}`}
              >
                <span className="language-option-icon">{lang.icon}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="header-right">
        <button
          className={`btn-run ${isRunning ? 'running' : ''}`}
          onClick={onRun}
          disabled={isRunning}
          id="run-button"
        >
          {isRunning ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <FiPlay className="run-icon" />
              <span>Run Code</span>
            </>
          )}
        </button>

        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          id="theme-toggle"
        >
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
        </button>

        {isAuthenticated ? (
          <div className="user-menu">
            <button className="btn-user" id="user-menu-button">
              <FiUser />
              <span>{user?.username}</span>
              <FiChevronDown />
            </button>
            <div className="user-dropdown">
              <div className="user-info">
                <span className="user-email">{user?.email}</span>
              </div>
              <button className="user-dropdown-item" onClick={logout} id="logout-button">
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : (
          <button className="btn-login" onClick={onAuthClick} id="login-button">
            <FiLogIn />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
