// main.js — manejo del formulario y UI ligera
document.addEventListener('DOMContentLoaded', function(){
  // Insertar año en footer
  const yearEl = document.getElementById('year'); if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Carousel mejorado con animaciones
  const testimonials = document.querySelectorAll('.testimonial');
  let current = 0;
  let isAnimating = false;

  const show = (idx, direction = 1) => {
    if(isAnimating) return;
    isAnimating = true;

    // Ocultar actual
    testimonials[current].classList.remove('active');
    
    // Actualizar índice
    current = (idx + testimonials.length) % testimonials.length;
    
    // Mostrar nuevo
    testimonials[current].style.transform = `translateX(${direction * 20}px)`;
    testimonials[current].style.opacity = '0';
    testimonials[current].classList.add('active');
    
    // Animar entrada
    setTimeout(() => {
      testimonials[current].style.transform = '';
      testimonials[current].style.opacity = '';
      isAnimating = false;
    }, 50);
  };

  // Event listeners
  document.querySelectorAll('.carousel .next').forEach(btn => 
    btn.addEventListener('click', () => show((current + 1), 1))
  );
  
  document.querySelectorAll('.carousel .prev').forEach(btn => 
    btn.addEventListener('click', () => show((current - 1), -1))
  );
  
  // Auto-rotate cada 5 segundos
  setInterval(() => show(current + 1), 5000);

  // Form handling directo a WhatsApp
  const form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      
      const formData = new FormData(form);
      const nombre = formData.get('nombre');
      const email = formData.get('email');
      const telefono = formData.get('telefono');
      const horario = formData.get('horario');
      const mensaje = formData.get('mensaje');
      
      // Crear mensaje de WhatsApp
      const whatsappMsg = encodeURIComponent(
        `Hola, soy ${nombre}.\n` +
        `Email: ${email}\n` +
        `Teléfono: ${telefono}\n` +
        `Horario preferido: ${horario}\n` +
        `Consulta: ${mensaje}`
      );
      const whatsappUrl = `https://wa.me/34613978291?text=${whatsappMsg}`;
      
      // Abrir WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Mostrar mensaje de confirmación
      form.style.display = 'none';
      const confirmDiv = document.createElement('div');
      confirmDiv.className = 'alert alert-success mt-4';
      confirmDiv.innerHTML = `
        <h4>¡Gracias por contactar!</h4>
        <p>Te hemos redirigido a WhatsApp para completar tu consulta.</p>
        <p>Si no se abrió automáticamente, <a href="${whatsappUrl}" target="_blank">haz clic aquí</a>.</p>
        <button onclick="location.reload()" class="btn btn-secondary mt-2">Enviar otra consulta</button>
      `;
      form.parentNode.appendChild(confirmDiv);
    });
  }

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  if(navToggle){
    navToggle.addEventListener('click', ()=>{
      document.querySelector('.nav').classList.toggle('open');
    });
  }
});
