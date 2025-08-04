# EstragaLux

## Problema principal encontrado no teste
A node_modulos subiu para o github, isso não é uma boa prática, deixa o fork ou clone do projeto muito pesado, então eu crire um .gitignore para evitar isso.

Fazer o projeto funcionar também não deu certo, precisei de comandos adicionais e um arquivo docker-composer.yml para rodar uma imagem mongodb, é melhor para quando se está a usar o Docker, fica tudo dentro do docker. Portanto, corrigi o ficheiro README-v1.md.

## Sobre o BUG.
O que diz a issue: 
"Foi-nos indicado pelos nossos colaboradores que de um momento para o outro os pagamentos deixaram de apresentar as datas corretas, infelizmente não conseguimos obter mais detalhes. A tua tarefa é identificar se realmente existe algum problema e caso exista, corrigi-lo."

Minha resposta: Como não sei como era antes e como está agora para saber o que houve, o que posso dizer é que: se estamos a funcionar a aplicação em Portugal, a função formatDate() em todos os ficheiros está apontando para o relógio universal, portanto está a mostar horas erradas. Otimizei a função somente no ficheiro de Payments.tsx e coloquei o fuso horário de Lisboa. Caso esse seja o problema relatado, agora todo pagamento mostra exatamente a hora que foi registado.