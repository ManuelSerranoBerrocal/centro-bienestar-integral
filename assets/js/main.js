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

  // Form handling con Formspree + WhatsApp
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if(form){
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';

      const formData = new FormData(form);

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          // Crear mensaje de WhatsApp y enviarlo automáticamente
          const whatsappMsg = encodeURIComponent(
            `Hola Mercedes, soy ${formData.get('nombre')}.\n` +
            `Email: ${formData.get('email')}\n` +
            `Teléfono: ${formData.get('telefono')}\n` +
            `Horario preferido: ${formData.get('horario')}\n` +
            `Consulta: ${formData.get('mensaje')}`
          );
          const whatsappUrl = `https://wa.me/34604249083?text=${whatsappMsg}`;
          
          // Abrir WhatsApp automáticamente
          window.open(whatsappUrl, '_blank');
          
          // Redirigir a página de agradecimiento
          const params = new URLSearchParams({
            nombre: formData.get('nombre'),
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            horario: formData.get('horario'),
            mensaje: formData.get('mensaje')
          });
          window.location.href = `gracias.html?${params.toString()}`;
        } else {
          const data = await response.json();
          status.textContent = data.error || 'Hubo un error al enviar el formulario.';
          status.style.color = 'red';
        }
      } catch(err) {
        status.textContent = 'Error de conexión. Intenta nuevamente.';
        status.style.color = 'red';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
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
