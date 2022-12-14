// Preenchendo o jogo a partir do javascript
function novoElemento(tagName, className){
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

// Função para criar uma barreira.
function Barreira(reversa = false){ //metodo construtor que vai ser instanciado
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    // Verificar se vai adicionar primeiro a borda ou o corpo
    //Se for uma barreira reversa vai ser primeiro o corpo, Caso seja uma normal vai aparecer uma borda
    this.elemento.appendChild(reversa ? corpo : borda )
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

// const b = new Barreira(true)
// b.setAltura(300)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function ParDeBarreiras(altura, abertura, x){
    this.elemento = novoElemento('div','par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    // Calculo da abertura da barede para o passaro passar
    this.sortearAbertura = () =>{
        //calculando altura
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        //setando altura calculada
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }
    // Saber em algum momento onde o par de barreiras está
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

// const b = new ParDeBarreiras(700, 200, 800)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function Barreiras(altura, largura, abertura, espaco, notificarPonto){
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura,abertura, largura + espaco * 2),
        new ParDeBarreiras(altura,abertura, largura + espaco * 3)
    ]
    
    const deslocamento = 3
    this.animar = () =>{
        this.pares.forEach(par =>{
            par.setX(par.getX() - deslocamento)

            //quando elemento sair da área do jogo
            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * ( this.pares.length))
                par.sortearAbertura()//se n sortear, todas as aberturas serão iguais
            }

            const meio = largura / 2
            // se o par.getx() e o deslocamento forem maior ou igual ao meio E par.getx(posição) for menor q o meio, é pq acabou de cruzar com o meio 
            const cruzouOMeio = par.getX() + deslocamento >= meio && par.getX() < meio
            if(cruzouOMeio) notificarPonto()
        })
    }
}

function Passaro(alturaJogo){
    let voando = false
    //Criando o Elemento Passaro
    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/mordecai.png'
    //Fazendo com que o passaro voe apertando qualquer tecla
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    //manipulando altura do passaro
    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)//ele voa mais rapido do que cai
        const alturaMaxima = alturaJogo - this.elemento.clientHeight // Subtrai altura do passaro e do jogo para que ele n ultrapasse o teto
    
        if(novoY <= 0){
            this.setY(0)
        }else if(novoY >= alturaMaxima){
            this.setY(alturaMaxima)
        }else{
            this.setY(novoY)
        }
    } 
    this.setY(alturaJogo / 2 )
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos =>{
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}



// const barreiras = new Barreiras(700, 1200, 200, 400)
// const passaro = new Passaro(700)
// const areadojogo = document.querySelector('[wm-flappy]')
// // Chamar a função animar e colocando ela no setInterval
// areadojogo.appendChild(passaro.elemento)
// areadojogo.appendChild(new Progresso().elemento)
// barreiras.pares.forEach(par => areadojogo.appendChild(par.elemento))
// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20)


function estaoSobreposto(elementoA, elementoB) {
    //pegar o retangulo ao elemento e consiga fazer validação se esta sobreposto ou n
    const a = elementoA.getBoundingClientRect()//retangulo associado ao elemento A 
    const b = elementoB.getBoundingClientRect()//retangulo associado ao elemento B

    //teste para saber se há sobreposição horizontal
    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

function colidiu(passaro, barreiras){
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras =>{
        if(!colidiu){
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobreposto(passaro.elemento, superior) || estaoSobreposto(passaro.elemento, inferior)
        }
    })
    return colidiu
}


function FlappyBird() {
    let pontos = 0
 
    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth
 
    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400,
        () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)
 
    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
 
    this.start = () => {
        // loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if(colidiu(passaro, barreiras)){
                clearInterval(temporizador)
            }
        }, 20)
    }
}
 


