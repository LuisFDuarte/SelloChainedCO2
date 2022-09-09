
# Smart contract Proyecto Sello Chained CO2

Sello Chained CO2 son NFTs dinámicos que muestran la huella de carbono actual de un producto o servicio según su consumo de energía eléctrica. Estos NFTs sirven como un sello o certificación que muestra con qué porcentaje de energía renovable funciona una empresa o usuario.

**Autores**:

* Luis Duarte (LuisFDuarte)

* Mario Sanchez (mszjar)

* Jhoer Perez (jho3r)

Este proyecto esta basado en el reto de [NFTs Dinámicos de Camilo Molano](https://github.com/camohe90).

## Instrucciones

Tener en cuenta de crear un archivo `.env` con las variables especificadas en [`.env.example`](./.env.example)

### Instalar dependencias

``` bash
yarn 
```

### Para ejecutar las pruebas del contrato

``` bash
yarn test
```

### Para ejecutar pruebas de despliegue

``` bash
yarn test:deploy
```

### Para compilar el contrato

``` bash
yarn compile
```

### Para desplegar el contrato dependiendo de la red

``` bash
yarn deploy:rinkeby
```

``` bash
yarn deploy:goerli
```

### Generar el documento para la validacion del contrato

Se debe tener en cuenta de eliminar todos los comentarios relacionados a la licencia
y dejar solo uno al inicio del archivo flatten.txt  

``` bash
yarn flatten
```
