export default function Footer() {
  return (
    <footer>
      <img src={`${import.meta.env.BASE_URL}logo.webp`} alt="" width="72" height="72" />
      <div>
        <strong>The Astronomical Society for Training, Research and Outreach (ASTRO)</strong>
        <br />
        Hyderabad, Telangana, India · Registered under UDYAM MSME: UDYAM-TS-20-0209280
      </div>
      <div>
        <a href="mailto:explore@astroforeveryone.com">explore@astroforeveryone.com</a> ·{' '}
        <a href="https://wa.me/918186862621" target="_blank" rel="noopener noreferrer">WhatsApp +91-8186862621</a>
      </div>
      <div>© {new Date().getFullYear()} ASTRO · Dr Ravi Raja Pothineni</div>
    </footer>
  )
}
