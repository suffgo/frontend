<template>
  <div v-bind="$attrs">
    <div v-if="props.showImage && room">
      <div class="flex justify-between">
        <!-- Contenedor de imagen -->
        <div :style="containerStyle" class="group relative w-full max-h-[40vh] mx-auto overflow-hidden mt-0 p-0">
          <img class="absolute inset-0 w-full h-full object-cover filter blur-md mt-0 p-0"
            :src="room.image || defaultImage" alt="Imagen de fondo" crossOrigin="anonymous" />
          <BackButton class="absolute top-2 left-2 z-10" />
          <!-- Imagen principal -->
          <img class="relative w-full h-full object-contain object-center mt-0 p-0" ref="imgElement"
            :src="room.image || defaultImage" alt="Imagen de la sala" @load="extractDominantColor"
            crossOrigin="anonymous" />
        </div>
      </div>
    </div>
    <div v-if="room" class="bg-secondary/10 rounded-xl p-5 mb-5">
      <h1 class="font-semibold text-center">{{ room.room_title }}</h1>

      <div class="flex justify-between">
        <div>
          <h2 class="mb-2">Descripción</h2>
          <p class="mb-4">
            {{ room.description || 'Sin descripción' }}
          </p>
        </div>
        <div class="align-baseline">
          <div class="flex flex-end align-baseline justify-end">
            <h2 class="mb-2 mr-2 flex flex-end justify-end">Código</h2>
            <button @click="toggleBlur" class="text-secondary">
              <div v-if="isBlurred" class="text-primary mb-1 mr-0 p-0">
                <Icon icon="mdi:eye-closed" width="24" height="24" />

              </div>
              <div v-else class="text-primary mb-1 mr-0 p-0">
                <Icon icon="ic:outline-remove-red-eye" width="24" height="24" />
              </div>
            </button>
          </div>

          <div class="flex justify-end gap-2">
            <button onclick="my_modal_2.showModal()" class="tooltip" data-tip="Mostrar QR">
              <Icon class="text-primary" icon="ic:baseline-qr-code-scanner" width="24" height="24" />
            </button>
            <dialog id="my_modal_2" class="modal">
              <div class="modal-box">
                <form method="dialog">
                  <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <div class="flex flex-col items-center justify-center">
                  <QrJoinCodeGenerator :id="room.id" />
                </div>
              </div>
            </dialog>
            <div class="flex gap-2 group">
              <h2 class="text-secondary" :class="{ blurredText: isBlurred }">
                {{ room.room_code }}
              </h2>
              <button @click="copyToClipboard" alt="copiar codigo en el portapapeles"
                class="btn btn-sm lg:opacity-0 lg:group-hover:opacity-100 border-none shadow-none hover:bg-transparent bg-transparent p-0">
                <Icon icon="fa6-regular:copy" class="w-5 h-5 text-primary font-bold" />
              </button>
            </div>
          </div>

          <transition name="fade">
            <div v-if="copied"
              class="fixed top-20 left-1/2 transform -translate-x-1/2 bg-success text-accent  px-2 py-1 rounded-lg text-xs md:text-sm lg:text-sm">
              Link copiado en el portapapeles
            </div>
          </transition>
        </div>
      </div>

      <div>
        <h2 v-if="formattedDate" class="mb-2">Fecha y hora</h2>
        <h1 class="font-semibold mb-4">{{ formattedDate }}</h1>
      </div>


      <h2 class="mb-2">Administrador</h2>
      <h1 class="font-semibold mb-4">{{ room.admin_name }}</h1>
    </div>
    <div class="flex flex-col items-center justify-center text-center" v-else>
      <p>No se encontraron datos de la sala. Por favor, únete a una sala primero.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Icon } from "@iconify/vue";
import BackButton from "../reusable/BackButton2.vue";
import ColorThief from 'colorthief';
import QrJoinCodeGenerator from './lobby/components/QrJoinCodeGenerator.vue';
import RoomService from '../../services/room.service';

const props = defineProps({
  showImage: { type: Boolean, default: false },
  roomId: { type: [String, Number], required: true }
})

const room = ref(null);
const copied = ref(false); // Estado para mostrar si el link fue copiado

onMounted(async () => {
  await fetchRoomData();
  await checkWhitelist();
});

const fetchRoomData = async () => {
  try {
    localStorage.removeItem('currentRoom');
    const response = await RoomService.find(String(props.roomId))
    const data = JSON.parse(response);
    room.value = data.room
    localStorage.setItem('currentRoom', JSON.stringify(data.room));
  } catch (err) {
    window.location.href = '/404'
    console.error('Error:', err.error);
  }

  if (!room) {
    window.location.href = '/404'
  }
};

const checkWhitelist = async () => {
  try {
    // aquí sí tienes room.value.room_code
    await RoomService.join({ room_code: room.value.room_code })

  } catch (err) {
    const status = err.status
    if (status === 403 || status === 400) {
      // rediriges cuando tu API te diga que no está en la whitelist
      window.location.href = '/protected/joinRoom'
    } else {
      // otro tipo de error
      console.error('Error inesperado:', err)
    }
  }
}
// Propiedad computada para formatear la fecha
const formattedDate = computed(() => {
  if (!room.value || !room.value.start_time) {
    return '';
  }
  const date = new Date(room.value.start_time);
  const day = date.getDate();
  // Obtenemos el mes en formato largo (en español)
  const month = date.toLocaleString('es-ES', { month: 'long' });
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes();

  // Determinar am/pm y convertir a formato de 12 horas
  const period = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;

  // Formatear los minutos para que siempre sean 2 dígitos
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

  return `${day} de ${month} ${hours}:${formattedMinutes} ${period}`;
});


const copyToClipboard = () => {
  navigator.clipboard.writeText(room.value.room_code).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000); // Ocultar el mensaje después de 2 segundos
  }).catch((err) => {
    console.error('Error al copiar el texto:', err);
  });
};

const isBlurred = ref(true);

// Función para alternar el estado
const toggleBlur = () => {
  isBlurred.value = !isBlurred.value;
};


const defaultImage = '/defaultRoomImage.png';
const dominantColor = ref('');
const imgElement = ref(null);


const extractDominantColor = () => {
  if (imgElement.value && imgElement.value.complete) {
    try {
      const colorThief = new ColorThief();
      const result = colorThief.getColor(imgElement.value);
      dominantColor.value = `rgb(${result.join(',')})`;
    } catch (error) {
      console.error('Error al extraer el color dominante:', error);
    }
  }
};

const containerStyle = computed(() => ({
  boxShadow: dominantColor.value ? `0 4px 10px ${dominantColor.value}` : 'none'
}));
</script>

<style scoped>
.room-info-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.room-info-container h1 {
  margin-bottom: 1.5rem;
}

.room-info-container p {
  margin: 0.5rem 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.blurredText {
  filter: blur(5px);
}

.btn-ghost {
  @apply text-primary
}
</style>