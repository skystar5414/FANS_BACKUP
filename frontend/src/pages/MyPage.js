import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';

const MyPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');

  // 비밀번호 변경 상태
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    verificationCode: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  // 회원탈퇴 상태
  const [deleteData, setDeleteData] = useState({
    verificationCode: '',
    confirmText: ''
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteVerificationSent, setDeleteVerificationSent] = useState(false);

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);

        // 토큰 확인
        let token = localStorage.getItem('token');
        if (!token) {
          token = sessionStorage.getItem('token');
        }

        if (!token) {
          navigate('/login');
          return;
        }

        // 사용자 프로필 정보 가져오기
        const response = await fetch('/api/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('사용자 데이터:', data.data.user);
          console.log('선호 카테고리:', data.data.user.preferredCategories);
          console.log('선호 언론사:', data.data.user.preferredSources);
          console.log('선호 언론사 타입:', typeof data.data.user.preferredSources);
          console.log('선호 언론사 배열 여부:', Array.isArray(data.data.user.preferredSources));
          setUser(data.data.user);
        } else if (response.status === 401) {
          // 토큰이 만료된 경우
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          navigate('/login');
          return;
        } else {
          throw new Error('사용자 정보를 가져올 수 없습니다.');
        }

      } catch (err) {
        console.error('사용자 데이터 로드 에러:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/');
      }
    } catch (error) {
      console.error('로그아웃 에러:', error);
      // 에러가 발생해도 로컬 스토리지는 정리
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      navigate('/');
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 성별 표시 함수
  const getGenderDisplay = (gender) => {
    switch(gender) {
      case 'male': return '남성';
      case 'female': return '여성';
      case 'other': return '기타';
      default: return '미설정';
    }
  };

  // 로그인 방식 표시 함수
  const getProviderDisplay = (provider) => {
    switch(provider) {
      case 'local': return '일반 로그인';
      case 'kakao': return '카카오 로그인';
      case 'naver': return '네이버 로그인';
      default: return '일반 로그인';
    }
  };

  // 비밀번호 변경 인증 이메일 발송
  const sendPasswordVerification = async () => {
    try {
      setPasswordLoading(true);
      setPasswordError('');

      let token = localStorage.getItem('token');
      if (!token) {
        token = sessionStorage.getItem('token');
      }

      const response = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ type: 'password' })
      });

      const data = await response.json();
      if (data.success) {
        setVerificationSent(true);
        setPasswordSuccess('인증코드가 이메일로 발송되었습니다.');
      } else {
        setPasswordError(data.error || '인증 이메일 발송에 실패했습니다.');
      }
    } catch (err) {
      setPasswordError('서버 연결에 실패했습니다.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // 비밀번호 변경
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError('');

      let token = localStorage.getItem('token');
      if (!token) {
        token = sessionStorage.getItem('token');
      }

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();
      if (data.success) {
        setPasswordSuccess('비밀번호가 성공적으로 변경되었습니다.');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          verificationCode: ''
        });
        setVerificationSent(false);
      } else {
        setPasswordError(data.error || '비밀번호 변경에 실패했습니다.');
      }
    } catch (err) {
      setPasswordError('서버 연결에 실패했습니다.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // 회원탈퇴 인증 이메일 발송
  const sendDeleteVerification = async () => {
    try {
      setDeleteLoading(true);
      setDeleteError('');

      let token = localStorage.getItem('token');
      if (!token) {
        token = sessionStorage.getItem('token');
      }

      const response = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ type: 'delete' })
      });

      const data = await response.json();
      if (data.success) {
        setDeleteVerificationSent(true);
        alert('인증코드가 이메일로 발송되었습니다.');
      } else {
        setDeleteError(data.error || '인증 이메일 발송에 실패했습니다.');
      }
    } catch (err) {
      setDeleteError('서버 연결에 실패했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // 회원탈퇴
  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (deleteData.confirmText !== '회원탈퇴') {
      setDeleteError('확인 문구를 정확히 입력해주세요.');
      return;
    }

    if (!confirm('정말로 회원탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      setDeleteLoading(true);
      setDeleteError('');

      let token = localStorage.getItem('token');
      if (!token) {
        token = sessionStorage.getItem('token');
      }

      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ verificationCode: deleteData.verificationCode })
      });

      const data = await response.json();
      if (data.success) {
        alert('회원탈퇴가 완료되었습니다.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/');
      } else {
        setDeleteError(data.error || '회원탈퇴에 실패했습니다.');
      }
    } catch (err) {
      setDeleteError('서버 연결에 실패했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mypage-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mypage-container">
        <div className="error">오류: {error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mypage-container">
        <div className="error">사용자 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <button
          className="back-button"
          onClick={() => navigate('/')}
        >
          ← 홈으로
        </button>
        <h1>마이페이지</h1>
      </div>

      <div className="mypage-nav">
        <button
          className={`nav-button ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          회원정보
        </button>
        <button
          className={`nav-button ${activeSection === 'account' ? 'active' : ''}`}
          onClick={() => setActiveSection('account')}
        >
          계정관리
        </button>
      </div>

      <div className="mypage-content">
        {activeSection === 'profile' && (
          <section className="user-info-section">
            <h2>📋 회원정보</h2>
            <div className="user-info-card">
              <div className="user-details">
                <div className="user-name">{user.name || user.username}</div>
                <div className="user-email">{user.email}</div>

                {/* 4x2 기본 정보 그리드 */}
                <div className="user-info-grid">
                  <div className="info-card" style={{ '--index': 0 }}>
                    <div className="info-icon">👤</div>
                    <div className="info-label">아이디</div>
                    <div className="info-value">{user.username}</div>
                  </div>

                  <div className="info-card" style={{ '--index': 1 }}>
                    <div className="info-icon">📱</div>
                    <div className="info-label">연락처</div>
                    <div className="info-value">{user.phone || '미등록'}</div>
                  </div>

                  <div className="info-card" style={{ '--index': 2 }}>
                    <div className="info-icon">🔐</div>
                    <div className="info-label">로그인 방식</div>
                    <div className="info-value">{getProviderDisplay(user.provider)}</div>
                  </div>

                  <div className="info-card" style={{ '--index': 3 }}>
                    <div className="info-icon">📅</div>
                    <div className="info-label">가입일</div>
                    <div className="info-value">{formatDate(user.createdAt)}</div>
                  </div>

                  <div className="info-card" style={{ '--index': 4 }}>
                    <div className="info-icon">🕒</div>
                    <div className="info-label">마지막 로그인</div>
                    <div className="info-value">{user.lastLogin ? formatDate(user.lastLogin) : '기록 없음'}</div>
                  </div>

                  <div className="info-card" style={{ '--index': 5 }}>
                    <div className="info-icon">⚥</div>
                    <div className="info-label">성별</div>
                    <div className="info-value">{user.gender ? getGenderDisplay(user.gender) : '미설정'}</div>
                  </div>

                  <div className="info-card" style={{ '--index': 6 }}>
                    <div className="info-icon">🎂</div>
                    <div className="info-label">나이</div>
                    <div className="info-value">{user.age ? `${user.age}세` : '미설정'}</div>
                  </div>

                  <div className="info-card" style={{ '--index': 7 }}>
                    <div className="info-icon">📍</div>
                    <div className="info-label">지역</div>
                    <div className="info-value">{user.location || '미설정'}</div>
                  </div>
                </div>

                {/* 관심사 섹션 */}
                {(user.preferredCategories && user.preferredCategories.length > 0) && (
                  <div className="preferences-section">
                    <h4>🎯 관심 카테고리</h4>
                    <div className="preference-tags">
                      {user.preferredCategories.map((category, index) => (
                        <span key={index} className="preference-tag">{category}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 선호 언론사 섹션 */}
                <div className="preferences-section">
                  <h4>📰 선호 언론사</h4>
                  {(user.preferredSources && Array.isArray(user.preferredSources) && user.preferredSources.length > 0) ? (
                    <div className="preference-tags">
                      {user.preferredSources.map((source, index) => (
                        <span key={index} className="preference-tag">{source}</span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#718096', textAlign: 'center', padding: '20px' }}>
                      설정된 선호 언론사가 없습니다.
                    </p>
                  )}
                </div>

                {/* 선호도가 설정되지 않은 경우 */}
                {(!user.preferredCategories || user.preferredCategories.length === 0) &&
                 (!user.preferredSources || user.preferredSources.length === 0) && (
                  <div className="preferences-section">
                    <h4>🔧 프로필 설정</h4>
                    <p style={{ color: '#718096', textAlign: 'center', padding: '20px' }}>
                      아직 선호도가 설정되지 않았습니다. 프로필 설정을 완료해보세요!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeSection === 'account' && (
          <section className="account-management-section">
            <h2>⚙️ 계정관리</h2>

            {/* 로그아웃 */}
            <div className="account-card">
              <h3>로그아웃</h3>
              <p>현재 세션에서 로그아웃합니다.</p>
              <button className="logout-btn" onClick={handleLogout}>
                로그아웃
              </button>
            </div>

            {/* 비밀번호 변경 */}
            {user.provider === 'local' && (
              <div className="account-card">
                <h3>비밀번호 변경</h3>
                <p>보안을 위해 이메일 인증이 필요합니다.</p>

                {!verificationSent ? (
                  <button
                    className="verification-btn"
                    onClick={sendPasswordVerification}
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? '발송 중...' : '인증 이메일 발송'}
                  </button>
                ) : (
                  <form onSubmit={handlePasswordChange} className="password-form">
                    {passwordError && (
                      <div className="error-message">{passwordError}</div>
                    )}
                    {passwordSuccess && (
                      <div className="success-message">{passwordSuccess}</div>
                    )}

                    <div className="form-group">
                      <label>인증 코드</label>
                      <input
                        type="text"
                        value={passwordData.verificationCode}
                        onChange={(e) => setPasswordData({...passwordData, verificationCode: e.target.value})}
                        placeholder="이메일로 받은 6자리 코드"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>현재 비밀번호</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>새 비밀번호</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        placeholder="최소 8자 이상"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>새 비밀번호 확인</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => {
                          setVerificationSent(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                            verificationCode: ''
                          });
                          setPasswordError('');
                          setPasswordSuccess('');
                        }}
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="submit-btn"
                        disabled={passwordLoading}
                      >
                        {passwordLoading ? '변경 중...' : '비밀번호 변경'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* 회원탈퇴 */}
            <div className="account-card danger">
              <h3>회원탈퇴</h3>
              <p>계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.</p>
              <ul className="warning-list">
                <li>• 모든 개인정보가 삭제됩니다</li>
                <li>• 북마크, 좋아요, 댓글 기록이 삭제됩니다</li>
                <li>• 탈퇴 후 동일한 이메일로 재가입이 제한될 수 있습니다</li>
              </ul>

              {!deleteVerificationSent ? (
                <button
                  className="verification-btn danger"
                  onClick={sendDeleteVerification}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? '발송 중...' : '탈퇴 인증 이메일 발송'}
                </button>
              ) : (
                <form onSubmit={handleDeleteAccount} className="delete-form">
                  {deleteError && (
                    <div className="error-message">{deleteError}</div>
                  )}

                  <div className="form-group">
                    <label>인증 코드</label>
                    <input
                      type="text"
                      value={deleteData.verificationCode}
                      onChange={(e) => setDeleteData({...deleteData, verificationCode: e.target.value})}
                      placeholder="이메일로 받은 6자리 코드"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>확인 문구 입력</label>
                    <input
                      type="text"
                      value={deleteData.confirmText}
                      onChange={(e) => setDeleteData({...deleteData, confirmText: e.target.value})}
                      placeholder="'회원탈퇴'를 입력하세요"
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setDeleteVerificationSent(false);
                        setDeleteData({
                          verificationCode: '',
                          confirmText: ''
                        });
                        setDeleteError('');
                      }}
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="submit-btn danger"
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? '탈퇴 처리 중...' : '회원탈퇴'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MyPage;