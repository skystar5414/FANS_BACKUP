import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import './NewsDetailPage.css';

function NewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [comments, setComments] = useState([
    
    {
      id: 1,
      author: '김민수',
      content: '정말 유익한 정보네요! AI 기술의 발전이 이렇게 빠를 줄 몰랐습니다.',
      timestamp: '2024-01-15 14:30',
      likes: 12,
      isLiked: false,
      replies: [
        {
          id: 11,
          author: '박지영',
          content: '맞아요! 특히 의료 분야에서의 활용이 인상적이에요.',
          timestamp: '2024-01-15 15:45',
          likes: 5,
          isLiked: false
        }
      ]
    },
    {
      id: 2,
      author: '이수현',
      content: '하지만 AI로 인한 일자리 변화에 대한 대비책도 필요할 것 같아요.',
      timestamp: '2024-01-15 16:20',
      likes: 8,
      isLiked: true,
      replies: []
    },
    {
      id: 3,
      author: '정현우',
      content: '교육 분야의 개인화된 학습이 정말 흥미롭네요. 더 자세한 내용이 궁금합니다.',
      timestamp: '2024-01-15 17:10',
      likes: 3,
      isLiked: false,
      replies: []
    }
  ]);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('comments');

  const API_BASE = process.env.REACT_APP_API_BASE || '';

  useEffect(() => {
    if (!id) return;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/news/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setArticle(data);
      } catch (err) {
        console.error('기사 로드 실패:', err);
        setError('기사를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, API_BASE]);

  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch(`${API_BASE}/api/user/bookmark/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: isBookmarked ? 'remove' : 'add'
        })
      });

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
      }
    } catch (err) {
      console.error('북마크 처리 실패:', err);
    }
  };

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    // TODO: 구독 API 연동
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  const handleCommentLike = (commentId, isReply = false, parentId = null) => {
    setComments(prev => prev.map(comment => {
      if (!isReply && comment.id === commentId) {
        return {
          ...comment,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          isLiked: !comment.isLiked
        };
      }
      if (isReply && comment.id === parentId) {
        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                isLiked: !reply.isLiked
              };
            }
            return reply;
          })
        };
      }
      return comment;
    }));
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      author: '익명 사용자',
      content: newComment,
      timestamp: new Date().toLocaleString('ko-KR'),
      likes: 0,
      isLiked: false,
      replies: []
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  if (loading) {
    return (
      <div className="news-detail-container">
        <div className="loading">기사를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="news-detail-container">
        <div className="error">
          <p>{error || '기사를 찾을 수 없습니다.'}</p>
          <button onClick={() => navigate('/')} className="back-button">
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="news-detail-container">
      {/* 메인 헤더 사용 */}
      <Header />

      {/* 기사 제목 */}
      <div className="article-title-wrapper">
        <h1 className="article-headline">{article.title}</h1>
      </div>

      {/* 메타 정보 및 액션 버튼 */}
      <div className="article-meta-actions">
        <div className="article-actions">
          <button
            className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
            onClick={handleSubscribe}
          >
            {isSubscribed ? '구독중' : '구독하기'}
          </button>
          <button className="share-btn" onClick={handleShare}>
            공유
          </button>
        </div>
        <div className="article-meta">
          <span className="source">{article.source || article.agency}</span>
          {article.journalist && <span className="journalist">{article.journalist}</span>}
          <span className="pub-date">최초 발행: {formatDate(article.pub_date)}</span>
          <span className="updated-date">마지막 수정: {formatDate(article.updated_at)}</span>
        </div>
      </div>

      <div className="news-detail-content">
        {/* 메인 콘텐츠 영역 */}
        <div className="main-content">
          {/* 기사 이미지 */}
          {article.image_url && (
            <div className="article-image-section">
              <img
                src={article.image_url}
                alt={article.title}
                className="article-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* 기사 내용 */}
          <div className="article-content-section">
            <div className="article-summary">
              {article.ai_summary || article.summary}
            </div>

            <div className="article-full-content">
              {article.content ? (
                article.content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                // 실제 기사 내용 예시
                <>
                  <p>최근 발표된 연구 결과에 따르면, 인공지능 기술의 발전이 다양한 산업 분야에서 혁신적인 변화를 이끌어내고 있다고 밝혔습니다.</p>

                  <p>특히 의료, 금융, 교육 등의 분야에서 AI 기술의 활용도가 급격히 증가하고 있으며, 이는 기존의 업무 방식과 서비스 제공 방식에 근본적인 변화를 가져오고 있습니다.</p>

                  <p>의료 분야에서는 AI를 활용한 진단 시스템이 의사들의 정확한 진단을 돕고 있으며, 환자 개개인에게 맞춤형 치료법을 제공하는 데 큰 도움을 주고 있습니다. 또한 신약 개발 과정에서도 AI 기술이 활용되어 개발 기간을 단축하고 효율성을 높이는 효과를 보이고 있습니다.</p>

                  <p>금융업계에서는 AI 기반의 위험 관리 시스템과 자동화된 투자 상담 서비스가 고객들에게 더 나은 금융 서비스를 제공하고 있습니다. 특히 개인 맞춤형 금융 상품 추천과 실시간 사기 탐지 시스템이 크게 주목받고 있습니다.</p>

                  <p>교육 분야에서도 AI 기술의 도입으로 개인화된 학습 경험이 가능해지고 있습니다. 학습자의 수준과 선호도를 분석하여 최적화된 학습 콘텐츠를 제공하고, 학습 진도와 이해도를 실시간으로 모니터링할 수 있게 되었습니다.</p>

                  <p>전문가들은 이러한 AI 기술의 발전이 앞으로도 계속될 것이며, 더 많은 분야에서 혁신적인 변화를 가져올 것으로 예상한다고 말했습니다. 하지만 동시에 AI 기술의 윤리적 사용과 인간의 일자리에 미치는 영향에 대해서도 신중한 고려가 필요하다고 강조했습니다.</p>

                  <p>이에 따라 정부와 기업들은 AI 기술의 발전과 함께 관련 정책과 가이드라인을 수립하고, 인력 재교육 프로그램을 확대하는 등의 노력을 기울이고 있습니다.</p>
                </>
              )}
            </div>
          </div>

          {/* 탭 섹션 */}
          <div className="tab-section">
            {/* 탭 헤더 */}
            <div className="tab-headers">
              <button
                className={`tab-header ${activeTab === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveTab('comments')}
              >
                댓글 {comments.length}개
              </button>
              <button
                className={`tab-header ${activeTab === 'media-info' ? 'active' : ''}`}
                onClick={() => setActiveTab('media-info')}
              >
                언론사 정보
              </button>
              <button
                className={`tab-header ${activeTab === 'analysis' ? 'active' : ''}`}
                onClick={() => setActiveTab('analysis')}
              >
                분석
              </button>
            </div>

            {/* 탭 컨텐츠 */}
            <div className="tab-content">
              {activeTab === 'comments' && (
                <div className="comments-tab">
                  {/* 댓글 작성 폼 */}
                  <div className="comment-form">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="댓글을 작성해주세요..."
                      className="comment-input"
                      rows="3"
                    />
                    <button
                      onClick={handleAddComment}
                      className="comment-submit-btn"
                      disabled={!newComment.trim()}
                    >
                      댓글 작성
                    </button>
                  </div>

                  {/* 댓글 목록 */}
                  <div className="comments-list">
                    {comments.map(comment => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-header">
                          <span className="comment-author">{comment.author}</span>
                          <span className="comment-timestamp">{comment.timestamp}</span>
                        </div>
                        <div className="comment-content">{comment.content}</div>
                        <div className="comment-actions">
                          <button
                            className={`comment-like-btn ${comment.isLiked ? 'liked' : ''}`}
                            onClick={() => handleCommentLike(comment.id)}
                          >
                            👍 {comment.likes}
                          </button>
                          <button className="comment-reply-btn">답글</button>
                        </div>

                        {/* 대댓글 */}
                        {comment.replies.length > 0 && (
                          <div className="replies-list">
                            {comment.replies.map(reply => (
                              <div key={reply.id} className="reply-item">
                                <div className="comment-header">
                                  <span className="comment-author">{reply.author}</span>
                                  <span className="comment-timestamp">{reply.timestamp}</span>
                                </div>
                                <div className="comment-content">{reply.content}</div>
                                <div className="comment-actions">
                                  <button
                                    className={`comment-like-btn ${reply.isLiked ? 'liked' : ''}`}
                                    onClick={() => handleCommentLike(reply.id, true, comment.id)}
                                  >
                                    👍 {reply.likes}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'media-info' && (
                <div className="media-info-tab">
                  <div className="media-info-content">
                    <h4>언론사 정보</h4>
                    <div className="media-detail">
                      <div className="info-row">
                        <span className="info-label">언론사명:</span>
                        <span className="info-value">{article.source || article.agency}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">기자:</span>
                        <span className="info-value">{article.journalist || '정보 없음'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">카테고리:</span>
                        <span className="info-value">{article.category || '일반'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">발행일:</span>
                        <span className="info-value">{formatDate(article.pub_date)}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">최종 수정:</span>
                        <span className="info-value">{formatDate(article.updated_at)}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">원본 링크:</span>
                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="info-link">
                          기사 원문 보기
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analysis' && (
                <div className="analysis-tab">
                  <div className="analysis-content">
                    <h4>기사 분석</h4>
                    <div className="analysis-summary">
                      <div className="analysis-item">
                        <h5>주요 키워드</h5>
                        <div className="keywords-display">
                          {article.keywords && article.keywords.length > 0 ? (
                            article.keywords.map((keyword, index) => (
                              <span key={index} className="keyword-tag">
                                {keyword}
                              </span>
                            ))
                          ) : (
                            <div className="sample-keywords">
                              <span className="keyword-tag">인공지능</span>
                              <span className="keyword-tag">기술혁신</span>
                              <span className="keyword-tag">의료</span>
                              <span className="keyword-tag">금융</span>
                              <span className="keyword-tag">교육</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="analysis-item">
                        <h5>감정 분석</h5>
                        <div className="sentiment-analysis">
                          <div className="sentiment-bar">
                            <div className="positive-bar" style={{width: '65%'}}></div>
                            <div className="neutral-bar" style={{width: '25%'}}></div>
                            <div className="negative-bar" style={{width: '10%'}}></div>
                          </div>
                          <div className="sentiment-labels">
                            <span className="positive">긍정적 65%</span>
                            <span className="neutral">중립적 25%</span>
                            <span className="negative">부정적 10%</span>
                          </div>
                        </div>
                      </div>
                      <div className="analysis-item">
                        <h5>가독성 점수</h5>
                        <div className="readability-score">
                          <div className="score-circle">
                            <span className="score-number">8.2</span>
                            <span className="score-max">/10</span>
                          </div>
                          <p className="score-description">읽기 쉬운 기사입니다</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 사이드바 */}
        <div className="sidebar-content">
          <Sidebar />
        </div>
      </div>

    </div>
  );
}

export default NewsDetailPage;