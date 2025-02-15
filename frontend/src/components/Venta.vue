<template>
  <v-layout align-start>
    <v-flex>
      <v-data-table
        :headers="headers"
        :items="ventas"
        :search="search"
        sort-by="nombre"
        class="elevation-1"
      >
        <template v-slot:[`item.estado`]="{ item }">
          <div v-if="item.estado">
            <span class="blue--text">Aceptado</span>
          </div>
          <div v-else>
            <span class="red--text">Anulado</span>
          </div>
        </template>

        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Ventas</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-text-field
              class="text-xs-center"
              v-model="search"
              append-icon="search"
              label="Busqueda"
              single-line
              hide-details
              v-if="verNuevo === 0"
            />
            <v-spacer></v-spacer>

            <v-btn
              color="primary"
              dark
              class="mb-2"
              v-if="verNuevo === 0"
              @click="mostrarNuevo()"
            >
              Nuevo Venta
            </v-btn>

            <v-dialog v-model="dialog" max-width="1000px">
              <v-card>
                <v-card-title>
                  <span class="headline">Seleccione un artículo</span>
                </v-card-title>
                <v-card-text>
                  <v-container grid-list-md>
                    <v-layout wrap>
                      <v-flex xs12 sm12 md12 lg12 xl12>
                        <v-text-field
                          v-model="texto"
                          @keyup.enter="listarArticulos()"
                          class="text-xs-center"
                          append-icon="search"
                          label="Búsqueda"
                        ></v-text-field>
                        <template>
                          <v-data-table
                            :headers="headerArticulos"
                            :items="articulos"
                            class="elevation-1"
                          >
                            <template v-slot:items="props">
                              <td>{{ props.item.codigo }}</td>
                              <td>{{ props.item.nombre }}</td>
                              <td>{{ props.item.categoria.nombre }}</td>
                              <td>{{ props.item.stock }}</td>
                              <td>{{ props.item.precio_venta }}</td>
                              <td>{{ props.item.descripcion }}</td>
                            </template>
                            <template v-slot:[`item.estado`]="{ item }">
                              <td>
                                <div v-if="item.estado">
                                  <span class="blue--text">Activo</span>
                                </div>
                                <div v-else>
                                  <span class="red--text">Inactivo</span>
                                </div>
                              </td>
                            </template>
                            <template v-slot:[`item.seleccionar`]="{ item }">
                              <td class="justify-center layout px-0">
                                <v-icon
                                  small
                                  class="mr-2"
                                  @click="agregarDetalle(item)"
                                >
                                  add
                                </v-icon>
                              </td>
                            </template>
                          </v-data-table>
                        </template>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close"
                    >Cancelar</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-dialog v-model="adModal" max-width="350">
              <v-card>
                <v-card-title class="headline" v-if="adAccion === 1">
                  Activar Item
                </v-card-title>
                <v-card-title class="headline" v-if="adAccion == 2">
                  Desactivar Item
                </v-card-title>
                <v-card-text>
                  Estas a punto de
                  <span v-if="adAccion === 1">Activar</span>
                  <span v-if="adAccion === 2">Desactivar</span>
                  el item "{{ adNombre }}"
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="green darken-1" text @click="cerrar()">
                    Cancelar
                  </v-btn>
                  <v-btn
                    color="orange darken-1"
                    text
                    @click="activar()"
                    v-if="adAccion === 1"
                  >
                    Activar
                  </v-btn>
                  <v-btn
                    color="orange darken-4"
                    text
                    @click="desactivar()"
                    v-if="adAccion === 2"
                  >
                    Desactivar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-dialog v-model="comprobanteModal" max-width="1000px">
              <v-card>
                <v-card-title class="headline">
                  Reporte de Ventas
                  <v-btn class="ml-2" @click="crearPDF()">
                    <v-icon class="mr-2">print</v-icon>
                  </v-btn>
                </v-card-title>

                <v-card-text>
                  <div id="factura">
                    <header>
                      <div id="logo">
                        <img
                          src="data:image/png;base64,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"
                          id="imagen"
                        />
                      </div>
                      <div id="datos">
                        <p id="encabezado">
                          <b>Sistema Ventas</b>
                          <br />
                          Kevin Martinez
                          <br />
                          Telefono:(+1) 555-5555-555
                          <br />
                          Email: kevin@example.com
                        </p>
                      </div>
                      <div id="fact">
                        <p>
                          {{ tipo_comprobante }}
                          <br />
                          {{ serie_comprobante }}-{{ num_comprobante }}<br />
                          {{ fecha }}
                        </p>
                      </div>
                    </header>
                    <br />
                    <section>
                      <div>
                        <table id="facliente">
                          <tbody>
                            <tr>
                              <td id="cliente">
                                <strong>{{ persona.nombre }}</strong
                                ><br />
                                <strong>Documento:</strong>
                                {{ persona.num_documento }}<br />
                                <strong>Dirección:</strong>
                                {{ persona.direccion }}
                                <br />
                                <strong>Teléfono:</strong> {{ persona.telefono
                                }}<br />
                                <strong>Email:</strong> {{ persona.email }}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </section>
                    <br />
                    <section>
                      <div>
                        <table id="facarticulo">
                          <thead>
                            <tr id="fa">
                              <th>CANT</th>
                              <th>DESCRIPCION</th>
                              <th>PRECIO UNIT</th>
                              <th>DESC.</th>
                              <th>PRECIO TOTAL</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="det in detalles" :key="det._id">
                              <td style="text-align: center">
                                {{ det.cantidad }}
                              </td>
                              <td>{{ det.articulo }}</td>
                              <td style="text-align: right">
                                {{ det.precio }}
                              </td>
                              <td style="text-align: right">
                                {{ det.descuento }}
                              </td>
                              <td style="text-align: right">
                                {{ det.cantidad * det.precio - det.descuento }}
                              </td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr>
                              <th></th>
                              <th></th>
                              <th></th>
                              <th style="text-align: right">SUBTOTAL</th>
                              <th style="text-align: right">
                                $
                                {{
                                  (totalParcial = (
                                    total - totalImpuesto
                                  ).toFixed(2))
                                }}
                              </th>
                            </tr>
                            <tr>
                              <th></th>
                              <th></th>
                              <th></th>
                              <th style="text-align: right">
                                IVA({{ impuesto }})%
                              </th>
                              <th style="text-align: right">
                                $
                                {{
                                  (totalImpuesto = (
                                    (total * impuesto) /
                                    (1 + impuesto)
                                  ).toFixed(2))
                                }}
                              </th>
                            </tr>
                            <tr>
                              <th></th>
                              <th></th>
                              <th></th>
                              <th style="text-align: right">TOTAL</th>
                              <th style="text-align: right">
                                $ {{ (total = calcularTotal).toFixed(2) }}
                              </th>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </section>
                    <br />
                    <br />
                    <footer>
                      <div id="gracias">
                        <p><b>Gracias por su compra!</b></p>
                      </div>
                    </footer>
                  </div>
                </v-card-text>

                <v-card-actions>
                  <v-btn
                    color="blue darken-1"
                    text
                    @click="ocultarComprobante()"
                    >Cancelar</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <template v-if="item.estado">
            <v-icon small @click="toogleActivate(2, item)">block</v-icon>
          </template>
          <template v-else>
            <v-icon small @click="toogleActivate(1, item)">check</v-icon>
          </template>
          <v-icon small class="ml-2" @click="verIngreso(item)">tab</v-icon>
          <v-icon small class="ml-2" @click="mostrarComprobante(item)"
            >print</v-icon
          >
        </template>

        <template v-slot:no-data>
          <v-btn color="primary" @click="listar()"> Reset </v-btn>
        </template>
      </v-data-table>

      <v-container grid-list-sm class="pa-4 mt-4 white" v-if="verNuevo">
        <v-layout row wrap>
          <v-flex xs12 sm4 md4 lg4 xl4>
            <v-select
              v-model="tipo_comprobante"
              :items="comprobantes"
              label="Tipo Comprobante"
            >
            </v-select>
          </v-flex>
          <v-flex xs12 sm4 md4 lg4 xl4>
            <v-text-field v-model="serie_comprobante" label="Serie Comprobante">
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm4 md4 lg4 xl4>
            <v-text-field v-model="num_comprobante" label="Número Comprobante">
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm8 md8 lg8 xl8>
            <v-autocomplete :items="personas" v-model="persona" label="Cliente">
            </v-autocomplete>
          </v-flex>
          <v-flex xs12 sm4 md4 lg4 xl4>
            <v-text-field type="number" v-model="impuesto" label="Impuesto">
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm8 md8 lg8 x8>
            <v-text-field
              v-model="codigo"
              label="Código"
              @keyup.enter="buscarCodigo()"
            >
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm2 md2 lg2 xl2>
            <v-btn small fab dark color="teal" @click="mostrarModalArticulos()">
              <v-icon dark>list</v-icon>
            </v-btn>
          </v-flex>
          <v-flex xs12 sm2 md2 lg2 xl2 v-show="errorArticulo">
            <div class="red--text" v-text="errorArticulo"></div>
          </v-flex>

          <v-flex xs12 sm12 md12 lg12 xl12>
            <template>
              <v-data-table
                :headers="cabeceraDetalles"
                :items="detalles"
                hide-default-footer
                class="elevation-1"
              >
                <template v-slot:[`item.articulo`]="{ item }">
                  <td class="text-xs-center">{{ item.articulo }}</td>
                </template>
                <template v-slot:[`item.cantidad`]="{ item }">
                  <td class="text-xs-center">
                    <v-text-field type="number" v-model="item.cantidad">
                    </v-text-field>
                  </td>
                </template>
                <template v-slot:[`item.precio`]="{ item }">
                  <td class="text-xs-center">
                    <v-text-field type="number" v-model="item.precio">
                    </v-text-field>
                  </td>
                </template>
                <template v-slot:[`item.descuento`]="{ item }">
                  <td class="text-xs-center">
                    <v-text-field type="number" v-model="item.descuento">
                    </v-text-field>
                  </td>
                </template>
                <template v-slot:[`item.subtotal`]="{ item }">
                  <td class="text-xs-center">
                    $
                    {{
                      (item.cantidad * item.precio - item.descuento).toFixed(2)
                    }}
                  </td>
                </template>
                <template v-slot:[`item.borrar`]="{ item }">
                  <td>
                    <v-icon
                      small
                      class="mr-2"
                      @click="eliminarDetalle(detalles, item)"
                      >delete</v-icon
                    >
                  </td>
                </template>
                <template slot="no-data">
                  <h3>No hay articulos agregados al detalle.</h3>
                </template>
              </v-data-table>

              <div class="w-100 my-4">
                <v-flex class="text-xs-right">
                  <strong>Total Parcial:</strong> $
                  {{ (totalParcial = (total - totalImpuesto).toFixed(2)) }}
                </v-flex>
                <v-flex class="text-xs-right">
                  <strong>Total Impuesto:</strong> $
                  {{
                    (totalImpuesto = (
                      (total * impuesto) /
                      (1 + impuesto)
                    ).toFixed(2))
                  }}
                </v-flex>
                <v-flex class="text-xs-right">
                  <strong>Total Neto:</strong> $
                  {{ (total = calcularTotal).toFixed(2) }}
                </v-flex>
              </div>
            </template>
          </v-flex>
          <v-flex xs="12" sm="12" md="12" lg="12" xl="12" v-show="valida">
            <div
              class="red--text"
              v-for="v in validaMensaje"
              :key="v"
              v-text="v"
            ></div>
          </v-flex>
          <v-flex xs="12" sm="12" md="12" lg="12" xl="12">
            <v-btn color="blue darken-1" text @click.native="ocultarNuevo()"
              >Cancelar</v-btn
            >
            <v-btn
              color="success"
              text
              @click.native="guardar()"
              v-if="verDetalle === 0"
              >Guardar</v-btn
            >
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
import axios from "axios";
import moment from "moment";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default {
  data: () => ({
    search: "",
    ventas: [],
    dialog: false,
    dialogDelete: false,
    headers: [
      { text: "Usuario", value: "usuario.nombre", sortable: true },
      { text: "Proveedor", value: "persona.nombre", sortable: true },
      { text: "Tipo Comprobante", value: "tipo_comprobante", sortable: true },
      { text: "Serie Comprobante", value: "serie_comprobante", sortable: true },
      { text: "Numero Comprobante", value: "num_comprobante", sortable: true },
      { text: "Fecha", value: "createdAt", sortable: true },
      { text: "Impuesto", value: "impuesto", sortable: true },
      { text: "Total", value: "total", sortable: true },
      { text: "Estado", value: "estado", sortable: false },
      { text: "Actions", value: "actions", sortable: false },
    ],
    _id: "",
    persona: "",
    personas: [],
    tipo_comprobante: "",
    num_comprobante: "",
    comprobantes: ["BOLETA", "FACTURA", "TICKET", "GUIA"],
    serie_comprobante: "",
    impuesto: 0.18,
    codigo: "",
    cabeceraDetalles: [
      { text: "Articulo", value: "articulo", sortable: false },
      { text: "Cantidad", value: "cantidad", sortable: false },
      { text: "Precio", value: "precio", sortable: false },
      { text: "Descuento", value: "descuento", sortable: false },
      { text: "Sub Total", value: "subtotal", sortable: false },
      { text: "Borrar", value: "borrar", sortable: false },
    ],
    detalles: [],
    verNuevo: 0,

    articulos: [],
    texto: "",
    headerArticulos: [
      { text: "Codigo", value: "codigo", sortable: true },
      { text: "Nombre", value: "nombre", sortable: true },
      { text: "Categoria", value: "categoria.nombre", sortable: true },
      { text: "Stock", value: "stock", sortable: true },
      { text: "Precio Venta", value: "precio_venta", sortable: true },
      { text: "Descripcion", value: "descripcion", sortable: true },
      { text: "Estado", value: "estado", sortable: false },
      { text: "Seleccionar", value: "seleccionar", sortable: false },
    ],

    total: 0,
    totalParcial: 0,
    totalImpuesto: 0,

    verDetalle: 0,

    valida: 0,
    validaMensaje: [],
    adModal: 0,
    adAccion: 0,
    adNombre: "",
    errorArticulo: null,
    comprobanteModal: 0,
    fecha: null,
  }),

  computed: {
    calcularTotal: function () {
      let resultado = 0.0;
      for (let i = 0; i < this.detalles.length; i++) {
        resultado =
          resultado +
          (this.detalles[i].cantidad * this.detalles[i].precio -
            this.detalles[i].descuento);
      }
      return resultado;
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.cerrar();
    },
  },

  created() {
    this.listar();
    this.listarArticulos();
    this.selectPersona();
  },

  methods: {
    crearPDF() {
      var quotes = document.getElementById("factura");
      html2canvas(quotes).then(function (canvas) {
        var imgData = canvas.toDataURL("image/png");
        var imgWidth = 210;
        var pageHeight = 295;

        var imgHeight = (canvas.height * imgWidth) / canvas.width;
        var heightLeft = imgHeight;

        var doc = new jsPDF("p", "mm", "a4");
        var position = 0;

        doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          doc.addPage();
          doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        doc.save("ComprobanteVenta.pdf");
      });
    },

    mostrarComprobante(item) {
      this.limpiar();
      this.tipo_comprobante = item.tipo_comprobante;
      this.serie_comprobante = item.serie_comprobante;
      this.num_comprobante = item.num_comprobante;
      this.persona = item.persona;
      this.impuesto = item.impuesto;
      this.fecha = moment(item.createdAt).format("DD/MM/YYYY hh:mm");
      this.listarDetalles(item._id);
      this.comprobanteModal = 1;
    },
    ocultarComprobante() {
      this.comprobanteModal = 0;
    },

    selectPersona() {
      let header = { Token: this.$store.state.token };
      let configuracion = { headers: header };
      let personaArray = [];
      axios
        .get("persona/listClientes", configuracion)
        .then((response) => {
          personaArray = response.data;
          personaArray.map((cat) => {
            this.personas.push({ text: cat.nombre, value: cat._id });
          });
        })
        .catch((error) => {
          console.log(error);
        });
    },

    buscarCodigo() {
      this.errorArticulo = null;
      let header = { Token: this.$store.state.token };
      let configuracion = { headers: header };
      axios
        .get("articulo/queryCodigo?codigo=" + this.codigo, configuracion)
        .then((response) => {
          this.agregarDetalle(response.data);
        })
        .catch((error) => {
          this.errorArticulo = "No existe el articulo.";
        });
    },

    agregarDetalle(data) {
      this.errorArticulo = null;
      if (this.encuentra(data._id) === true) {
        this.errorArticulo = "El articulo ya ha sido agregado.";
      } else {
        this.detalles.push({
          _id: data._id,
          articulo: data.nombre,
          cantidad: 1,
          precio: data.precio_venta,
          descuento: 0,
        });
        this.codigo = "";
      }
    },

    encuentra(id) {
      let sw = 0;
      for (let i = 0; i < this.detalles.length; i++) {
        if (this.detalles[i]._id === id) {
          sw = true;
        }
      }
      return sw;
    },

    eliminarDetalle(arr, item) {
      let i = arr.indexOf(item);
      if (i !== -1) {
        arr.splice(i, 1);
      }
    },

    listar() {
      let header = { Token: this.$store.state.token };
      let configuracion = { headers: header };
      axios
        .get("venta/list", configuracion)
        .then((response) => {
          this.ventas = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    listarArticulos() {
      let header = { Token: this.$store.state.token };
      let configuracion = { headers: header };
      axios
        .get("articulo/list?valor=" + this.texto, configuracion)
        .then((response) => {
          this.articulos = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    listarDetalles(id) {
      let header = { Token: this.$store.state.token };
      let configuracion = { headers: header };
      axios
        .get("venta/query?_id=" + id, configuracion)
        .then((response) => {
          this.detalles = response.data.detalles;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    verIngreso(item) {
      this.limpiar();
      this.tipo_comprobante = item.tipo_comprobante;
      this.serie_comprobante = item.serie_comprobante;
      this.num_comprobante = item.num_comprobante;
      this.persona = item.persona._id;
      this.impuesto = item.impuesto;
      this.listarDetalles(item._id);
      this.verNuevo = 1;
      this.verDetalle = 1;
    },

    limpiar() {
      this._id = "";
      this.tipo_comprobante = "";
      this.serie_comprobante = "";
      this.num_comprobante = "";
      this.impuesto = 0.18;
      this.codigo = "";
      this.total = 0;
      this.totalParcial = 0;
      this.totalImpuesto = 0;
      this.detalles = [];
      this.verNuevo = 0;
      this.verDetalle = 0;

      this.valida = 0;
      this.validaMensaje = [];
      this.editedIndex = -1;
      this.adModal = 0;
    },

    validar() {
      this.valida = 0;
      this.validaMensaje = [];
      if (!this.persona) {
        this.validaMensaje.push("Seleccione un proveedor.");
      }
      if (!this.tipo_comprobante) {
        this.validaMensaje.push("Seleccione un tipo de comprobante.");
      }
      if (!this.num_comprobante) {
        this.validaMensaje.push("Ingrese el numero de comprobante.");
      }
      if (!this.impuesto || this.impuesto < 0 || this.impuesto > 1) {
        this.validaMensaje.push("Ingrese un impuesto valido.");
      }
      if (this.detalles.length <= 0) {
        this.validaMensaje.push("Ingrese al menos un articulo al detalle.");
      }
      if (this.validaMensaje.length) {
        this.valida = 1;
      }
      return this.valida;
    },

    mostrarNuevo() {
      this.verNuevo = 1;
    },
    ocultarNuevo() {
      this.verNuevo = 0;
      this.limpiar();
    },

    guardar() {
      let header = { Token: this.$store.state.token };
      let configuracion = { headers: header };

      if (this.validar()) {
        return;
      }

      axios
        .post(
          "venta/add",
          {
            persona: this.persona,
            usuario: this.$store.state.usuario._id,
            tipo_comprobante: this.tipo_comprobante,
            num_comprobante: this.num_comprobante,
            serie_comprobante: this.serie_comprobante,
            impuesto: this.impuesto,
            total: this.total,
            detalles: this.detalles,
          },
          configuracion
        )
        .then((response) => {
          this.limpiar();
          this.close();
          this.listar();
        })
        .catch((error) => {
          console.log(error);
        });
    },

    mostrarModalArticulos() {
      this.dialog = 1;
    },

    toogleActivate(action, item) {
      this.adModal = 1;
      this.adNombre = item.num_comprobante;
      this._id = item._id;
      if (action === 1) {
        this.adAccion = 1;
      } else if (action === 2) {
        this.adAccion = 2;
      } else {
        this.adModal = 0;
      }
    },

    activar() {
      let header = { Token: this.$store.state.token };
      let configuracion = { headers: header };

      axios
        .put(
          "venta/activate",
          {
            _id: this._id,
          },
          configuracion
        )
        .then((response) => {
          this.limpiar();
          this.close();
          this.listar();
        })
        .catch((error) => {
          console.log(error);
        });
    },

    desactivar() {
      let header = { Token: this.$store.state.token };
      let configuracion = { headers: header };

      axios
        .put(
          "venta/deactivate",
          {
            _id: this._id,
          },
          configuracion
        )
        .then((response) => {
          this.limpiar();
          this.close();
          this.listar();
        })
        .catch((error) => {
          console.log(error);
        });
    },

    cerrar() {
      this.adModal = 0;
    },

    close() {
      this.dialog = false;
    },
  },
};
</script>

<style>
#factura {
  padding: 20px;
  font-family: Arial, sans-serif;
  font-size: 16px;
  color: #000;
}

#logo {
  float: left;
  margin-left: 2%;
  margin-right: 2%;
}
#imagen {
  width: 100px;
}

#fact {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

#datos {
  float: left;
  margin-top: 0%;
  margin-left: 2%;
  margin-right: 2%;
  /*text-align: justify;*/
}

#encabezado {
  text-align: center;
  margin-left: 10px;
  margin-right: 10px;
  font-size: 16px;
}

section {
  clear: left;
}

#cliente {
  text-align: left;
}

#facliente {
  width: 40%;
  border-collapse: collapse;
  border-spacing: 0;
  margin-bottom: 15px;
}

#fa {
  color: #ffffff;
  font-size: 14px;
}

#facarticulo {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  padding: 20px;
  margin-bottom: 15px;
}

#facarticulo thead {
  padding: 20px;
  background: #2183e3;
  text-align: center;
  border-bottom: 1px solid #ffffff;
}

#gracias {
  text-align: center;
}
</style>