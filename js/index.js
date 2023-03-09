const ruleta = document.getElementById("ruleta");
let opcionesContainer;
let opciones = Array.from(document.getElementsByClassName("opcion"));
const root = document.documentElement;
const formContainer = document.getElementById("formContainer");
const modal = document.querySelector("dialog");
const totalElement = document.getElementById("porcentaje");
const botonCancelar = document.getElementById("cancelar");
const botonAceptar = document.getElementById("aceptar");
const botonAgregar = document.getElementById("agregar");
const ganadorTextoElement = document.getElementById("ganadorTexto");

let ganador = "";

let animacionCarga;

let sorteando = false;

const colores = [
  "020202",
  "38782c",
  "f5554a",
  "9fd984",
  "ffef62",
  "3bb3c1",
  "024164",
  "64bb6a",
  "006400",
  "B8860B",
  "D2691E",
  "A52A2A",
  "f6b35c",
  "f65cec",
];

let escala = screen.width < 550 ? screen.width * 0.7 : 400;
root.style.setProperty("--escala", escala + "px");

let suma = 0;

const uno = {
  nombre: "Uno",
  probabilidad: 20,
};
const dos = {
  nombre: "Dos",
  probabilidad: 20,
};
const tres = {
  nombre: "Tres",
  probabilidad: 20,
};
const cuatro = {
  nombre: "Cuatro",
  probabilidad: 20,
};
const cinco = {
  nombre: "Cinco",
  probabilidad: 20,
};

let conceptos = [uno, dos, tres, cuatro, cinco];

function sortear() {
  sorteando = true;
  ganadorTextoElement.textContent = ".";
  animacionCarga = setInterval(() => {
    switch (ganadorTextoElement.textContent) {
      case ".":
        ganadorTextoElement.textContent = "..";
        break;
      case "..":
        ganadorTextoElement.textContent = "...";
        break;
      default:
        ganadorTextoElement.textContent = ".";
        break;
    }
  }, 500);

  const nSorteo = Math.random();

  const giroRuleta = (1 - nSorteo) * 360 + 360 * 10;
  root.style.setProperty("--giroRuleta", giroRuleta + "deg");
  ruleta.classList.toggle("girar", true);

  let pAcumulada = 0;
  conceptos.forEach((concepto) => {
    if (
      nSorteo * 100 > pAcumulada &&
      nSorteo * 100 <= pAcumulada + concepto.probabilidad
    ) {
      ganador = concepto.nombre;
    }
    pAcumulada += concepto.probabilidad;
  });
}

ruleta.addEventListener("animationend", () => {
  ruleta.style.transform = "rotate(" + getCurrentRotation(ruleta) + "deg)";
  ruleta.classList.toggle("girar", false);
  sorteando = false;
  ganadorTextoElement.textContent = ganador;
  clearInterval(animacionCarga);
});

function ajustarRuleta() {
  if (opcionesContainer) ruleta.removeChild(opcionesContainer);
  opcionesContainer = document.createElement("div");
  opcionesContainer.id = "opcionesContainer";
  ruleta.appendChild(opcionesContainer);
  let pAcumulada = 0;
  conceptos.forEach((concepto, i) => {
    const opcionElement = document.createElement("div");
    opcionElement.classList.toggle("opcion", true);
    opcionElement.style = `
			--color: #${colores[i % colores.length]};
			--deg:${probabilidadAGrados(pAcumulada)}deg;
			${getPosicionParaProbabilidad(concepto.probabilidad)}`;
    opcionElement.addEventListener("click", () => onOpcionClicked(i));
    opcionesContainer.appendChild(opcionElement);

    const nombreElement = document.createElement("p");
    nombreElement.textContent = concepto.nombre;
    nombreElement.classList.add("nombre");
    nombreElement.style = `width : calc(${
      concepto.probabilidad
    } * var(--escala) * 1.5 / 80);
			transform: rotate(${
        probabilidadAGrados(concepto.probabilidad) / 2 +
        probabilidadAGrados(pAcumulada)
      }deg)`;
    opcionesContainer.appendChild(nombreElement);

    const separadorElement = document.createElement("div");
    separadorElement.style = `transform: rotate(${probabilidadAGrados(
      pAcumulada
    )}deg)`;
    separadorElement.classList.add("separador");
    opcionesContainer.appendChild(separadorElement);
    pAcumulada += concepto.probabilidad;
    //Reseteo la posición y el cartel
    ruleta.style.transform = "rotate(0deg)";
    ganadorTextoElement.textContent = "¡Click en Girar para iniciar!";
  });
}

document.getElementById("sortear").addEventListener("click", () => {
  if (!sorteando) sortear();
});

function onOpcionClicked(i) {
  Array.from(formContainer.children).forEach((element) =>
    formContainer.removeChild(element)
  );

  conceptos.forEach((concepto) => {
    agregarConfiguracionProbabilidad(concepto);
  });
  modal.showModal();
  verificarValidezFormulario();
}

botonAceptar.addEventListener("click", () => {
  conceptos = Array.from(formContainer.children).map(
    (opcion) =>
      (nuevaProbabilidad = {
        nombre:
          opcion.children[0].tagName === "LABEL"
            ? opcion.children[0].textContent
            : opcion.children[0].value,
        pInicial: 0,
        probabilidad: parseFloat(opcion.children[1].value),
      })
  );
  ajustarRuleta();
  modal.close();
});

botonCancelar.addEventListener("click", () => {
  modal.close();
});

function verificarValidezFormulario() {
  suma = 0;
  Array.from(formContainer.children).forEach((opcion) => {
    suma += parseFloat(opcion.children[1].value);
  });
  botonAceptar.disabled = suma !== 100;
  totalElement.textContent = suma.toString();
}

document.getElementById("agregar").addEventListener("click", () => {
  agregarConfiguracionProbabilidad();
});

function agregarConfiguracionProbabilidad(probabilidad = undefined) {
  const opcionContainer = document.createElement("div");
  let opcionLabel;
  const opcionInput = document.createElement("input");
  const eliminarBoton = document.createElement("button");
  if (probabilidad) {
    opcionLabel = document.createElement("label");
    opcionLabel.textContent = probabilidad.nombre;
    opcionLabel.for = probabilidad.nombre;
    opcionInput.value = probabilidad.probabilidad;
    opcionLabel.type = "text";
  } else {
    opcionLabel = document.createElement("input");
  }
  opcionInput.type = "number";
  eliminarBoton.textContent = "X";
  opcionInput.addEventListener("change", () => verificarValidezFormulario());
  opcionContainer.appendChild(opcionLabel);
  opcionContainer.appendChild(opcionInput);
  opcionContainer.appendChild(eliminarBoton);
  formContainer.appendChild(opcionContainer);
  eliminarBoton.addEventListener("click", (event) => {
    event.target.parentNode.parentNode.removeChild(event.target.parentNode); //También puede ser formContainer.removeChild(event.target.parentNode)
    verificarValidezFormulario();
  });
}

function getPosicionParaProbabilidad(probabilidad) {
  if (probabilidad === 100) {
    return "";
  }
  if (probabilidad >= 87.5) {
    const x5 = Math.tan(probabilidadARadianes(probabilidad)) * 50 + 50;
    return `clip-path: polygon(50% 0%, 100% 0, 100% 100%, 0 100%, 0 0, ${x5}% 0, 50% 50%)`;
  }
  if (probabilidad >= 75) {
    const y5 =
      100 - (Math.tan(probabilidadARadianes(probabilidad - 75)) * 50 + 50);
    return `clip-path: polygon(50% 0%, 100% 0, 100% 100%, 0 100%, 0% ${y5}%, 50% 50%)`;
  }
  if (probabilidad >= 62.5) {
    const y5 =
      100 - (0.5 - 0.5 / Math.tan(probabilidadARadianes(probabilidad))) * 100;
    return `clip-path: polygon(50% 0%, 100% 0, 100% 100%, 0 100%, 0% ${y5}%, 50% 50%)`;
  }
  if (probabilidad >= 50) {
    const x4 = 100 - (Math.tan(probabilidadARadianes(probabilidad)) * 50 + 50);
    return `clip-path: polygon(50% 0, 100% 0, 100% 100%, ${x4}% 100%, 50% 50%)`;
  }
  if (probabilidad >= 37.5) {
    const x4 = 100 - (Math.tan(probabilidadARadianes(probabilidad)) * 50 + 50);
    return `clip-path: polygon(50% 0, 100% 0, 100% 100%, ${x4}% 100%, 50% 50%)`;
  }
  if (probabilidad >= 25) {
    const y3 = Math.tan(probabilidadARadianes(probabilidad - 25)) * 50 + 50;
    return `clip-path: polygon(50% 0, 100% 0, 100% ${y3}%, 50% 50%)`;
  }
  if (probabilidad >= 12.5) {
    const y3 =
      (0.5 - 0.5 / Math.tan(probabilidadARadianes(probabilidad))) * 100;
    return `clip-path: polygon(50% 0, 100% 0, 100% ${y3}%, 50% 50%)`;
  }
  if (probabilidad >= 0) {
    const x2 = Math.tan(probabilidadARadianes(probabilidad)) * 50 + 50;
    return `clip-path: polygon(50% 0, ${x2}% 0, 50% 50%)`;
  }
}

ajustarRuleta();
