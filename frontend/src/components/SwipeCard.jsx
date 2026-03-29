import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
} from 'framer-motion';
import { FiX, FiCheck, FiMapPin, FiUsers, FiBookmark } from 'react-icons/fi';
import PropTypes from 'prop-types';

const CATEGORY_GRADIENTS = {
  Software:    'linear-gradient(135deg, #3730a3 0%, #6366f1 60%, #818cf8 100%)',
  Design:      'linear-gradient(135deg, #7c3aed 0%, #a855f7 60%, #c084fc 100%)',
  Research:    'linear-gradient(135deg, #0e7490 0%, #06b6d4 60%, #67e8f9 100%)',
  Business:    'linear-gradient(135deg, #b45309 0%, #f59e0b 60%, #fcd34d 100%)',
  Competition: 'linear-gradient(135deg, #065f46 0%, #10b981 60%, #6ee7b7 100%)',
};

const CATEGORY_GLOW = {
  Software:    'rgba(99, 102, 241, 0.35)',
  Design:      'rgba(168, 85, 247, 0.35)',
  Research:    'rgba(6, 182, 212, 0.35)',
  Business:    'rgba(245, 158, 11, 0.35)',
  Competition: 'rgba(16, 185, 129, 0.35)',
};

const SwipeCard = ({ project, onSwipe, onSave }) => {
  const controls = useAnimation();
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  const rotate = useTransform(dragX, [-200, 200], [-18, 18]);
  const opacity = useTransform(dragX, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0]);

  const acceptOpacity = useTransform(dragX, [0, 80], [0, 1]);
  const rejectOpacity = useTransform(dragX, [-80, 0], [1, 0]);
  const saveOpacity   = useTransform(dragY, [-80, 0], [1, 0]);

  const handleDragEnd = async (_, info) => {
    const threshold = 150;
    const { offset, velocity } = info;

    if (offset.y < -100 || velocity.y < -500) {
      await controls.start({ y: -window.innerHeight, opacity: 0, transition: { duration: 0.2 } });
      if (onSave) onSave();
      return;
    }
    if (offset.x > threshold || velocity.x > 500) {
      await controls.start({ x: window.innerWidth, opacity: 0, transition: { duration: 0.2 } });
      onSwipe('right');
    } else if (offset.x < -threshold || velocity.x < -500) {
      await controls.start({ x: -window.innerWidth, opacity: 0, transition: { duration: 0.2 } });
      onSwipe('left');
    } else {
      controls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const gradient = CATEGORY_GRADIENTS[project.category] || CATEGORY_GRADIENTS.Software;
  const glow     = CATEGORY_GLOW[project.category]     || CATEGORY_GLOW.Software;

  return (
    <div className="swipe-card-container">
      <motion.div
        className="swipe-card"
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        style={{ x: dragX, y: dragY, rotate, opacity, '--card-glow': glow }}
        onDragEnd={handleDragEnd}
        animate={controls}
        whileTap={{ scale: 1.02 }}
      >
        {/* Gradient header */}
        <div className="card-header" style={{ background: gradient }}>
          <div className="card-header-overlay" />
          <div className="card-badges">
            {project.category && (
              <span className="card-category-badge">{project.category}</span>
            )}
            {project.projectType && (
              <span className="card-type-badge">{project.projectType}</span>
            )}
          </div>
          <h2 className="card-title">{project.title || 'Untitled Project'}</h2>
          {project.location && (
            <div className="card-location">
              <FiMapPin size={13} />
              <span>{project.location}</span>
            </div>
          )}
        </div>

        {/* Glass body */}
        <div className="card-body">
          <p className="card-description">
            {project.description || 'No description provided.'}
          </p>

          {project.skillsRequired?.length > 0 && (
            <div className="card-skills-section">
              <span className="card-skills-label">Skills Needed</span>
              <div className="card-skills-list">
                {project.skillsRequired.slice(0, 6).map((skill, i) => (
                  <span key={i} className="card-skill-pill">{skill}</span>
                ))}
                {project.skillsRequired.length > 6 && (
                  <span className="card-skill-pill card-skill-more">
                    +{project.skillsRequired.length - 6}
                  </span>
                )}
              </div>
            </div>
          )}

          {project.maxMembers && (
            <div className="card-meta">
              <FiUsers size={13} />
              <span>Up to {project.maxMembers} members</span>
            </div>
          )}
        </div>

        {/* Swipe hint bar */}
        <div className="card-action-bar">
          <div className="card-action-hint card-action-skip">
            <FiX size={14} /> Skip
          </div>
          <div className="card-action-hint card-action-save">
            <FiBookmark size={14} /> Save
          </div>
          <div className="card-action-hint card-action-apply">
            <FiCheck size={14} /> Apply
          </div>
        </div>

        {/* Drag overlays */}
        <motion.div className="drag-overlay drag-overlay-reject" style={{ opacity: rejectOpacity }}>
          <FiX size={48} />
          <span>Skip</span>
        </motion.div>
        <motion.div className="drag-overlay drag-overlay-accept" style={{ opacity: acceptOpacity }}>
          <FiCheck size={48} />
          <span>Apply</span>
        </motion.div>
        <motion.div className="drag-overlay drag-overlay-save" style={{ opacity: saveOpacity }}>
          <FiBookmark size={48} />
          <span>Save</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

SwipeCard.propTypes = {
  project: PropTypes.object.isRequired,
  onSwipe: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

export default SwipeCard;
