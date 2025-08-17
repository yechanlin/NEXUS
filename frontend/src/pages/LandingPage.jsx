import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiMessageCircle,
  FiArrowRight,
  FiCode,
  FiCalendar,
  FiStar,
  FiAward,
} from 'react-icons/fi';

const LandingPage = () => {
  const featuredProjects = [
    {
      title: 'E-commerce Platform',
      category: 'Software',
      description:
        'Build a full-stack e-commerce platform with React, Node.js, and MongoDB. Perfect for learning modern web development.',
      duration: '3 months',
      members: '2/4',
      color: 'bg-blue-500',
    },
    {
      title: 'Fitness Tracker App',
      category: 'Design',
      description:
        'Create a React Native fitness tracking app with real-time data visualization and social features.',
      duration: '2 months',
      members: '1/3',
      color: 'bg-purple-500',
    },
    {
      title: 'Climate Data Analysis',
      category: 'Research',
      description:
        'Analyze climate data using Python, pandas, and machine learning to create meaningful insights and visualizations.',
      duration: '6 weeks',
      members: '3/5',
      color: 'bg-green-500',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Martinez',
      role: 'Computer Science Student',
      content:
        'NEXUS helped me find amazing teammates for my web development project. We built a full-stack app that&apos;s now the centerpiece of my portfolio!',
      initials: 'SM',
      color: 'bg-blue-500',
    },
    {
      name: 'James Chen',
      role: 'Data Science Student',
      content:
        'The collaborative environment here is incredible. I learned so much working with other students on a machine learning project. Highly recommend!',
      initials: 'JC',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="mt-[-70px] min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <FiCode className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">NEXUS</span>
          </div>
          <nav className="hidden items-center space-x-6 md:flex">
            <a
              href="#"
              className="text-gray-400 transition-colors hover:text-white"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Home
            </a>
            <a
              href="#how-it-works"
              className="text-gray-400 transition-colors hover:text-white"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById('how-it-works')
                  .scrollIntoView({ behavior: 'smooth' });
              }}
            >
              How It Works
            </a>
            <a
              href="#projects"
              className="text-gray-400 transition-colors hover:text-white"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById('projects')
                  .scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Projects
            </a>
            <a
              href="#about"
              className="text-gray-400 transition-colors hover:text-white"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById('about')
                  .scrollIntoView({ behavior: 'smooth' });
              }}
            >
              About
            </a>
          </nav>
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="hidden rounded-lg px-4 py-2 text-gray-400 transition-colors hover:text-white sm:inline-flex"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-semibold text-white transition-all hover:from-blue-700 hover:to-purple-700"
            >
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-6xl">
            Build Your Portfolio{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Together
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl leading-relaxed text-gray-300">
            Collaborate on projects that enhance your skills and showcase your
            talents. Connect with fellow creators and build something amazing.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/create-project"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-lg font-semibold text-white transition-all hover:from-blue-700 hover:to-purple-700"
            >
              Post a Project
              <FiArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/mainPage"
              className="inline-flex items-center justify-center rounded-lg border border-blue-500 bg-transparent px-8 py-3 text-lg font-semibold text-blue-400 transition-all hover:bg-blue-500 hover:text-white"
            >
              Find a Project
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-800 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-300">
              Three simple steps to start collaborating and building your
              portfolio
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                <FiMessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-white">
                Post Your Project
              </h3>
              <p className="leading-relaxed text-gray-300">
                Share your project idea, required skills, and timeline. Make it
                clear what you&apos;re looking to build and learn.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                <FiUsers className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-white">
                Connect with Peers
              </h3>
              <p className="leading-relaxed text-gray-300">
                Browse applications from fellow creators, review their profiles,
                and choose the perfect collaborators.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-blue-600">
                <FiAward className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-white">
                Build Together
              </h3>
              <p className="leading-relaxed text-gray-300">
                Collaborate, learn from each other, and create something amazing
                that enhances everyone&apos;s portfolio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section id="projects" className="bg-gray-900 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Featured Projects
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-300">
              Join these exciting projects and start building your portfolio
              today
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project, index) => (
              <div
                key={index}
                className="group rounded-lg border border-gray-700 bg-gray-800 p-6 transition-all hover:border-blue-500/50 hover:shadow-lg"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${project.color}`}
                  >
                    {project.category}
                  </span>
                  <div className="flex items-center text-sm text-gray-400">
                    <FiCalendar className="mr-1 h-4 w-4" />
                    {project.duration}
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {project.title}
                </h3>
                <p className="mb-4 text-sm text-gray-300">
                  {project.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-400">
                    <FiUsers className="mr-1 h-4 w-4" />
                    {project.members} members
                  </div>
                  <Link
                    to="/mainPage"
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-blue-700 hover:to-purple-700"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-800 px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              What Users Say
            </h2>
            <p className="text-lg text-gray-300">
              Hear from creators who&apos;ve built amazing projects together
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-700 bg-gray-900 p-6"
              >
                <div className="mb-4 flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="mb-4 leading-relaxed text-gray-300">
                  {testimonial.content}
                </p>
                <div className="flex items-center">
                  <div
                    className={`mr-3 flex h-10 w-10 items-center justify-center rounded-full ${testimonial.color}`}
                  >
                    <span className="font-semibold text-white">
                      {testimonial.initials}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-gray-900 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              About NEXUS
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-300">
              Empowering the next generation of creators through collaborative
              learning and project-based experiences
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                <FiCode className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-white">
                Our Mission
              </h3>
              <p className="leading-relaxed text-gray-300">
                To bridge the gap between learning and real-world application by
                connecting students with meaningful project opportunities that
                enhance their skills and portfolios.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                <FiUsers className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-white">
                Community First
              </h3>
              <p className="leading-relaxed text-gray-300">
                We believe in the power of collaboration. Our platform fosters a
                supportive community where students can learn from each other
                and grow together.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-blue-600">
                <FiAward className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-white">
                Quality Projects
              </h3>
              <p className="leading-relaxed text-gray-300">
                Every project on NEXUS is carefully curated to ensure it
                provides valuable learning experiences and meaningful outcomes
                for all participants.
              </p>
            </div>
          </div>
          <div className="mt-16 rounded-lg border border-gray-700 bg-gray-800 p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="mb-4 text-2xl font-bold text-white">
                  Why Choose NEXUS?
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <div className="mr-3 h-2 w-2 rounded-full bg-blue-500"></div>
                    Real-world project experience
                  </li>
                  <li className="flex items-center">
                    <div className="mr-3 h-2 w-2 rounded-full bg-blue-500"></div>
                    Portfolio-building opportunities
                  </li>
                  <li className="flex items-center">
                    <div className="mr-3 h-2 w-2 rounded-full bg-blue-500"></div>
                    Networking with like-minded peers
                  </li>
                  <li className="flex items-center">
                    <div className="mr-3 h-2 w-2 rounded-full bg-blue-500"></div>
                    Skill development in collaborative environments
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4 text-2xl font-bold text-white">
                  Our Values
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <div className="mr-3 h-2 w-2 rounded-full bg-purple-500"></div>
                    Innovation and creativity
                  </li>
                  <li className="flex items-center">
                    <div className="mr-3 h-2 w-2 rounded-full bg-purple-500"></div>
                    Inclusivity and diversity
                  </li>
                  <li className="flex items-center">
                    <div className="mr-3 h-2 w-2 rounded-full bg-purple-500"></div>
                    Continuous learning
                  </li>
                  <li className="flex items-center">
                    <div className="mr-3 h-2 w-2 rounded-full bg-purple-500"></div>
                    Mutual support and growth
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-20">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
            Ready to Start Building?
          </h2>
          <p className="mb-8 text-xl leading-relaxed text-blue-100">
            Join thousands of creators who are already collaborating and
            building amazing projects together.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-lg font-semibold text-blue-600 transition-all hover:bg-gray-100"
          >
            Get Started Today
            <FiArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900 px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                  <FiCode className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">NEXUS</span>
              </div>
              <p className="leading-relaxed text-gray-400">
                Empowering creators to build amazing projects together and
                enhance their portfolios through collaborative learning.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-white">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#how-it-works"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <Link
                    to="/mainPage"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Browse Projects
                  </Link>
                </li>
                <li>
                  <Link
                    to="/create-project"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Post Project
                  </Link>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Success Stories
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-white">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#help"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#guidelines"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Community Guidelines
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#privacy"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-white">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#twitter"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="#linkedin"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="#github"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="#discord"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 NEXUS. All rights reserved. Built with ❤️ for creator
              collaboration.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
