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

  // Form handling directo
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if(form){
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';

      const formData = new FormData(form);
      const datos = {
        nombre: formData.get('nombre'),
        email: formData.get('email'),
        telefono: formData.get('telefono'),
        horario: formData.get('horario'),
        mensaje: formData.get('mensaje')
      };

      try {
        const res = await fetch('http://localhost:3001/enviar-consulta', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(datos)
        });

        const data = await res.json();
        
        if (data.ok) {
          // Ocultar formulario y mostrar mensaje de éxito
          form.style.display = 'none';
          const confirmDiv = document.createElement('div');
          confirmDiv.className = 'alert alert-success mt-4';
          
          // Crear mensaje de WhatsApp
          const whatsappMsg = encodeURIComponent(
            `Hola, soy ${formData.nombre}.\n` +
            `Horario preferido: ${formData.horario}\n` +
            `Consulta: ${formData.mensaje}`
          );
          const whatsappUrl = `https://wa.me/34613978291?text=${whatsappMsg}`;
          
          confirmDiv.innerHTML = `
            <h4>¡Gracias por contactar!</h4>
            <p>En breve nos pondremos en contacto contigo.</p>
            <p>También puedes contactarnos directamente por WhatsApp:</p>
            <a href="${whatsappUrl}" target="_blank" class="btn btn-success">
              Continuar en WhatsApp
            </a>
          `;
          form.parentNode.appendChild(confirmDiv);
        } else {
          status.textContent = data.message || 'Hubo un error al enviar el formulario.';
        }
      }catch(err){
        status.textContent = 'Error de conexión. Intenta nuevamente.';
      } finally{
        submitBtn.disabled = false; submitBtn.textContent = 'Enviar';
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
