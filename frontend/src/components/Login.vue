<template>
    <v-layout align-center justify-center>
        <v-flex xs12 sm8 md6 lg5 xl4>
            <v-card>
                <v-toolbar dark color="blue darken-3">
                    <v-toolbar-title>
                        Acceso al sistema
                    </v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <v-text-field v-model="email" type="email" autofocus color="accent" label="Email" required ></v-text-field>
                    <v-text-field v-model="password" type="password" color="accent" label="Password" required></v-text-field>
                    <v-flex class="red--text" v-if="error">
                        {{error}}
                    </v-flex>
                </v-card-text>
                <v-card-actions class="px-3 pb-3">
                    <v-flex text-xs-right>
                        <v-btn color="primary" @click="ingresar()">Ingresar</v-btn>
                    </v-flex>
                </v-card-actions>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>

import axios from 'axios';

export default {
    data() {
        return {
            email: '',
            password: '',
            error: null,
        }
    },
    methods: {
        ingresar(){
            axios.post('usuario/login', {
                email: this.email,
                password: this.password
            })
            .then(response => {
                return response.data;
            })
            .then(data => {
                this.$store.dispatch('guardarToken', data.tokenReturn);
                this.$router.push({name: 'home'});
            })
            .catch(error => {
                // console.log(error)
                this.error = null;
                if(error.response.status === 404){
                    this.error = "No existe el usuario o las credenciales son incorrectas";
                }else{
                    this.error = 'Ocurrio un error con el servidor';
                }
            });
        }
    },
}
</script>