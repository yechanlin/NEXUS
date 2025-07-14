import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
} from 'framer-motion';
import { FiX, FiCheck } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import PropTypes from 'prop-types';

const SwipeCard = ({ project, onSwipe, onSave }) => {
  const controls = useAnimation();
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Transform values for card rotation and opacity
  const rotate = useTransform(dragX, [-200, 200], [-25, 25]);
  const opacity = useTransform(
    dragX,
    [-300, -200, 0, 200, 300],
    [0, 1, 1, 1, 0],
  );

  // Background colors for accept/reject indicators
  const acceptScale = useTransform(dragX, [0, 150], [1.1, 1.5]);
  const rejectScale = useTransform(dragX, [-150, 0], [1.5, 1.1]);

  // Star indicator for upward swipe
  const starScale = useTransform(dragY, [-150, 0], [1.5, 1.1]);
  const starOpacity = useTransform(dragY, [-100, 0], [1, 0]);

  const handleDragEnd = async (_, info) => {
    const threshold = 150; // Reduced threshold for easier swiping
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    const velocityY = info.velocity.y;
    const offsetY = info.offset.y;

    // Upward swipe for save
    if (offsetY < -100 || velocityY < -500) {
      await controls.start({
        y: -window.innerHeight,
        opacity: 0,
        transition: { duration: 0.2 },
      });
      if (onSave) onSave();
      return;
    }
    // Consider both distance and velocity for swipe detection
    if (offset > threshold || velocity > 500) {
      await controls.start({
        x: window.innerWidth,
        opacity: 0,
        transition: { duration: 0.2 },
      });
      onSwipe('right');
    } else if (offset < -threshold || velocity < -500) {
      await controls.start({
        x: -window.innerWidth,
        opacity: 0,
        transition: { duration: 0.2 },
      });
      onSwipe('left');
    } else {
      // Reset card position if not swiped far enough
      controls.start({
        x: 0,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      });
    }
  };

  return (
    <div className="swipe-card-container">
      <motion.div
        className="swipe-card"
        drag={true}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        style={{
          x: dragX,
          y: dragY,
          rotate,
          opacity,
        }}
        onDragEnd={handleDragEnd}
        animate={controls}
        whileTap={{ scale: 1.05 }}
      >
        <div className="card-content">
          <h2>{project.title || 'Project Title'}</h2>
          <div className="project-type-badge">
            {project.projectType || 'Type'}
          </div>
          <p className="location">{project.location || 'Location'}</p>
          <p className="description">{project.description || 'Description'}</p>
          <div className="skills-list">
            {project.skillsRequired?.map((skill, index) => (
              <span key={index} className="skill-badge">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Swipe indicators */}
      <motion.div
        className="swipe-indicator reject"
        style={{ scale: rejectScale, opacity: dragX < 0 ? 1 : 0 }}
      >
        <FiX />
      </motion.div>
      <motion.div
        className="swipe-indicator accept"
        style={{ scale: acceptScale, opacity: dragX > 0 ? 1 : 0 }}
      >
        <FiCheck />
      </motion.div>
      {/* Star indicator for save (upward swipe) */}
      <motion.div
        className="swipe-indicator save"
        style={{
          scale: starScale,
          opacity: starOpacity,
          color: '#FFD700',
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <AiFillStar size={32} />
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
