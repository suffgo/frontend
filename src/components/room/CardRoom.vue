<template>
  <div v-bind="$attrs">
    <div v-if="sala" class="bg-neutral w-[90%] flex flex-col justify-center mx-auto P-0">
      <div class="flex justify-between">
        <!-- Contenedor de imagen -->
        <div :style="containerStyle" class="group relative w-full max-h-[40vh] mx-auto overflow-hidden mt-0 p-0">
          <img class="absolute inset-0 w-full h-full object-cover filter blur-md mt-0 p-0"
            :src="sala.room.image || defaultImage" alt="Imagen de fondo" crossOrigin="anonymous" />
          <BackButton class="absolute top-2 left-2 z-10" />
          <img class="relative w-full h-full object-contain object-center mt-0 p-0" ref="imgElement"
            :src="sala.room.image || defaultImage" alt="Imagen de la sala" @load="extractDominantColor"
            crossOrigin="anonymous" />

          <!-- Botón para cambiar imagen (solo visible en pantallas grandes al hacer hover) -->
          <label for="fileInput"
            v-if="sala.room.state === 'created'"
            class="z-11 absolute bottom-4 right-4 flex items-center font-bold py-1 px-4 rounded-full lg:opacity-0 group-hover:opacity-100 transition-opacity btn-primary btn-xs cursor-pointer">
            Cambiar Foto
          </label>
          <input id="fileInput" type="file" class="hidden z-10" @change="handleFileChange" />
        </div>
      </div>

      <div class="relative flex justify-center items-center p-3 max-w-md mx-auto text-center gap-1 group ">
        <h1 v-if="!isEditing" class="font-semibold lg:ml-6">{{ sala.room.room_title }}</h1>
        <input v-else v-model="sala.room.room_title" type="text"
          class="input input-primary lg:text-xl text-xs font-semibold text-center" />
        <!-- Contenedor principal -->
        <div class="relative flex  gap-2">

          <!-- Botón de editar (solo visible cuando NO se está editando) -->
          <button v-if="!isEditing && sala.room.state === 'created'" @click="toggleEdit()"
          
            class="bg-primary text-neutral btn btn-xs btn-circle group-hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 sm:block  ">
            <Icon icon="proicons:pencil" class="w-6 h-5" />
          </button>

          <!-- Contenedor para los botones de edición -->
          <div v-if="isEditing" class="flex items-center gap-4 ">

            <!-- Botón de guardar (solo visible en pantallas pequeñas) -->
            <button @click="updateRoom()" class="sm:block lg:hidden p-0 bg-success rounded-full text-neutral">
              <Icon icon="material-symbols:check-rounded" class="w-6 h-6" />
            </button>

            <!-- Botón de cancelar (solo visible en pantallas pequeñas) -->
            <button @click="cancelEdit()" class="sm:block lg:hidden p-0 bg-error rounded-full text-neutral">
              <Icon icon="proicons:cancel" class="w-6 h-6" />
            </button>

            <!-- Botones de texto para pantallas grandes -->
            <div class="hidden lg:flex gap-4">
              <button @click="updateRoom()" class="btn btn-sm btn-primary">Guardar</button>
              <button @click="cancelEdit()" class="btn btn-sm btn-secondary">Cancelar</button>
            </div>
          </div>

        </div>
      </div>

      <div class="main-info bg-secondary/10 p-2">
        <div class="flex flex-col justify-between p-4">
          <div class="flex flex-col">
            <div class="relative">
              <div class="flex flex-row justify-between">
                <div class="flex flex-col">
                  <h2 class="">Descripción</h2>
                  <div v-if="!isEditing">
                    <p class="text-accent opacity-50">{{ sala.room.description }}</p>
                  </div>
                  <textarea v-else v-model="sala.room.description" class="textarea textarea-primary w-full"></textarea>
                </div>

                <!-- Boton de DropDown -->
                <div v-if="sala.room.state === 'created'" class="dropdown dropdown-left ">
                  <div tabindex="0" role="button"
                    class="btn rounded-full bg-transparent border-none hover:bg-transparent shadow-none">
                    <Icon icon="iconamoon:menu-kebab-horizontal-circle-bold"
                      class="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
                  </div>
                  <ul tabindex="0" class="dropdown-content menu bg-base-100 p-5 gap-3 rounded-xl shadow-lg z-10 ">
                    <li><a :href="`../proposal?id=${sala.room.id}`"
                        class="btn btn-primary btn-xs lg:btn-sm">Propuestas</a>
                    </li>
                    <li v-if="sala.room.is_formal"><a :href="`../formalSettingRoom?id=${sala.room.id}`"
                        class="btn btn-primary btn-xs lg:btn-sm pb-1">Otras
                        Configuraciones</a></li>
                    <li v-if="settingsRoom?.privacy"><a :href="`../user/addUser/${sala.room.id}`"
                        class="btn btn-primary btn-xs lg:btn-sm">Votantes</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="">
            <div class="">
              <h2 v-if="sala.room.start_time" class="mt-2">Fecha y hora programada</h2>
              <!-- Mostrar la fecha solo si startTime es válido -->
              <h2 v-if="sala.room.start_time" class="text-primary font-bold">
                {{ new Date(sala.room.start_time).toLocaleDateString('default', { month: 'long' }) }}
                {{ new Date(sala.room.start_time).toLocaleDateString('default', { day: 'numeric' }) }},
                {{ new Date(sala.room.start_time).toLocaleDateString('default', { year: 'numeric' }) }} -
                {{ new Date(sala.room.start_time).toLocaleTimeString('es-ES', {
                  hour: '2-digit', minute: '2-digit',
                  hour12: false
                }) }} hs
              </h2>
            </div>

            <div class="mt-6">
              <h2 class="text-md">Codigo de sala</h2>
              <div class="flex gap-2 group">
                <h2 class="text-primary text-md ">{{ sala.room.room_code }}</h2>
                <button @click="copyToClipboard"
                  class="btn btn-sm lg:opacity-0 lg:group-hover:opacity-100 border-none shadow-none hover:bg-transparent bg-transparent p-0">
                  <Icon icon="fa6-regular:copy" class="w-5 h-5 text-primary font-bold" />
                </button>
              </div>
              <!-- Tooltip que aparece cuando se copia -->
              <div v-if="copied"
                class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-success text-accent  px-2 py-1 rounded-lg text-xs md:text-sm lg:text-sm">
                Link copiado en el portapapeles
              </div>
            </div>

            <div class=" mt-4">
              <h2 class="text-md">Administrador</h2>
              <div class="flex gap-16">
                <h2 class="text-primary text-md">{{ sala.room.admin_name }}</h2>
              </div>
            </div>

          </div>

        </div>
      </div>
      <div v-if="hasProposal" class="flex justify-center p-2 ">
        <StartRoom client:load :roomId="props.roomId"/>
      </div>
      <div v-else class="flex justify-center p-2 ">
        <a :href="`../proposal?id=${sala.room.id}`" class="btn btn-primary">Crear Propuesta</a>
      </div>
    </div>
    <div v-if="state == 'finished'" class="flex flex-col justify-center items-center">
      <h1 class="mt-5">Resultados finales</h1>
      <div v-for="propuesta in resultados" :key="propuesta.id"
        class="flex flex-row flex-wrap justify-center items-center">
        <div class="m-10 flex flex-row flex-wrap justify-center gap-5">
          <CardResult :proposal="propuesta" :result="propuesta.options.map(opt => ({
            value: opt.option_value,
            count: opt.votes.length
          }))" />
          <UserVotes :proposal="propuesta" />
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import BackButton from '../reusable/BackButton2.vue';
import StartRoom from './lobby/components/StartRoom.vue';
import { Icon } from '@iconify/vue';
import ColorThief from 'colorthief';
import CardResult from './lobby/components/CardResult.vue';
import UserVotes from './lobby/components/UserVotes.vue';
import RoomService from '../../services/room.service';
import SettingRoomService from '../../services/settingroom.service';
import ProposalService from '../../services/proposal.service';

const props = defineProps({
  roomId: { type: [String, Number], required: true }
})

const sala = ref(null);
const error = ref(null);
const isEditing = ref(false);
const copied = ref(false);
const resultados = ref([]);
const hasProposal = ref(false);
const state = ref('');
const defaultImage = '/defaultRoomImage.png';
const settingsRoom = ref(null);


// Estilos dinámicos
const dominantColor = ref('');
const imgElement = ref(null);
const extractDominantColor = () => {
  if (imgElement.value?.complete) {
    try {
      const [r, g, b] = new ColorThief().getColor(imgElement.value);
      dominantColor.value = `rgb(${r},${g},${b})`;
    } catch { }
  }
};
const containerStyle = computed(() => ({
  boxShadow: dominantColor.value ? `0 4px 10px ${dominantColor.value}` : 'none'
}));

// Copiar código
const copyToClipboard = () => {
  navigator.clipboard.writeText(sala.value.room.room_code).then(() => {
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  });
};

// Carga de datos
onMounted(async () => {
  try {
    const roomTxt = await RoomService.find(props.roomId);
    sala.value = JSON.parse(roomTxt);
    if (!sala.value.room.privileges) {
      window.location.href = '/protected/menu';
    }
    state.value = sala.value.room.state;
    localStorage.setItem('currentRoom', JSON.stringify(sala.value.room));

    const settingsTxt = await SettingRoomService.byRoom(props.roomId);
    settingsRoom.value = JSON.parse(settingsTxt);
    localStorage.setItem('settingsRoom', settingsTxt);

    const proposalsTxt = await ProposalService.byRoom(props.roomId);
    const proposals = JSON.parse(proposalsTxt);
    hasProposal.value = proposals.length > 0;

    if (state.value === 'finished') {
      const resultsTxt = await ProposalService.results(props.roomId);
      resultados.value = JSON.parse(resultsTxt);
    }

  } catch (err) {
    error.value = err.error;
  }
});


// Edición de sala
const toggleEdit = () => (isEditing.value = !isEditing.value);
const updateRoom = () => {  
  const payload = {    
    name: sala.value.room.room_title,
    description: sala.value.room.description,
    link_invite: sala.value.room.link_invite,
    image: sala.value.room.image
  };
  RoomService.update(props.roomId, payload).then(() => (isEditing.value = false));
};
const cancelEdit = () => {
  const stored = JSON.parse(localStorage.getItem('currentRoom'));
  sala.value.room = stored;
  isEditing.value = false;
};

// Archivo
const handleFileChange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    sala.value.room.image = reader.result;
    updateRoom();
  };
  reader.readAsDataURL(file);
};

// Limpiar storage
onUnmounted(() => {
  localStorage.removeItem('currentRoom');
});
</script>


<style>
.main-info {
  border-radius: 30px;
}
</style>